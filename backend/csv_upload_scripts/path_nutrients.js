import { db } from '../models';
import { cleanString } from '../utils/common';
import { updatePathNutrients } from '../services/models/paths';
const fs = require('fs');
const csv = require('csv-parser');

export async function uploadPathNutrients(file) {
  // WARNING: must upload nutrients before uploading nutrientBenefits.

  // Adds/Updates nutrientPaths and paths records.

  // csv required columns:
  // pathName, nutrientsList
  // nutrientsList should be comma separated list of nutrient names.
  // csv optional columns:
  // notes, notesSources

  // Get or create ownerid for foodfriend. findOrCreate wasn't returning user like I needed.
  let admin = await db.User.findOne({
    where: {
      email: 'admin@foodfriend.io',
    },
  });
  if (!admin) {
    admin = await db.User.create({
      email: 'admin@foodfriend.io',
      firstName: 'Admin',
      lastName: 'Admin',
    });
  }

  // Get all benefits by name from db.
  let paths = await db.Path.findAll({ where: { ownerId: admin.id } });
  let pathsByName = paths.reduce(function (map, path) {
    map[cleanString(path.name)] = path;
    return map;
  }, {});

  // Get all nutrients by name from db.
  let nutrients = await db.Nutrient.findAll({});
  let nutrientsByName = nutrients.reduce(function (map, nutrient) {
    map[cleanString(nutrient.name)] = nutrient;
    return map;
  }, {});

  let pathNamesTouched = [];
  let pathNutrientsToUpdate = [];
  let pathsToCreate = [];
  let pathsToUpdate = [];
  // Unpack csv data by benefit row.
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (path) => {
      // TODO: add code to validate columns against bad or missing data for each field.
      if (pathNamesTouched.includes(cleanString(path.pathName))) {
        console.log(
          'Could not process duplicate path name.  Please revise csv.'
        );
        return;
      }

      // Check if path exists. If exists, update, else create new.
      const savedPath = pathsByName[cleanString(path.pathName)];
      if (savedPath) {
        // Put path nutrients in list to be updated.
        let pathNutrientIdsList = [];
        if (path.nutrientsList) {
          pathNutrientIdsList = path.nutrientsList
            .replace(/"/g, '')
            .split(',')
            .map((nutrientName) => {
              const cleanName = cleanString(nutrientName);
              if (nutrientsByName[cleanName])
                return nutrientsByName[cleanName].id;
              console.log(
                `nutrient name ${nutrientName} not synced with benefit ${path.pathName}`
              );
            })
            .filter((nutrientId) => !!nutrientId);
        }
        pathNutrientsToUpdate.push({
          pathName: path.pathName,
          nutrientIds: pathNutrientIdsList,
        });
        // Don't update benefit record if no changes have been made.
        if (
          savedPath.name === path.pathName &&
          savedPath.notes === path.notes &&
          savedPath.notesSources === path.notesSources
        )
          return;
        // Add benefit to list to be updated.
        pathsToUpdate.push({
          id: savedPath.id,
          name: path.pathName,
          notes: path.notes,
          notesSources: path.notesSources,
        });
      } else {
        // If benefit doesn't exit, add to benefitsToCreate list.
        // TODO: fix edge case: breaks when csv has two new benefits with same name.
        const newPath = {
          name: path.pathName,
          ownerId: admin.id,
          notes: path.notes,
          notesSources: path.notesSources,
          themeId: path.themeId,
        };
        pathsToCreate.push(newPath);
        let pathNutrientIdsList = [];
        if (path.nutrientsList) {
          pathNutrientIdsList = path.nutrientsList
            .replace(/"/g, '')
            .split(',')
            .map((nutrientName) => {
              const cleanName = cleanString(nutrientName);
              if (nutrientsByName[cleanName])
                return nutrientsByName[cleanName].id;
            })
            .filter((nutrientId) => !!nutrientId);
        }
        pathNutrientsToUpdate.push({
          pathName: path.pathName,
          nutrientIds: pathNutrientIdsList,
        });
      }
      pathNamesTouched.push(cleanString(path.pathName));
    })
    .on('end', async () => {
      try {
        console.log('CSV file successfully processed');
        // Delete csv from tmp/csv
        fs.unlinkSync(file.path, (err) => {
          console.error(err);
        });
        console.log('file deleted');

        // Update paths.
        const updatedPaths = await pathsToUpdate.map((path) => {
          db.Path.update(path, {
            returning: true,
            where: { id: path.id },
          });
        });

        // Create New paths
        const newPaths = await db.Path.bulkCreate(pathsToCreate);

        console.log(`${updatedPaths.length} paths updated.`);
        console.log(`${newPaths.length} paths created.`);

        // Sort existing and new paths by name.
        const paths = await db.Path.findAll({});
        const pathsByName = paths.reduce(function (map, path) {
          map[path.name] = path;
          return map;
        }, {});
        // Update NutrientPath records.
        pathNutrientsToUpdate.map((pathNutrients) => {
          if (!pathsByName[pathNutrients.pathName]) return;
          const pathId = pathsByName[pathNutrients.pathName].id;
          const nutrientIdsList = pathNutrients.nutrientIds;
          return updatePathNutrients(pathId, nutrientIdsList);
        });
      } catch (error) {
        console.log(error);
      }
      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
