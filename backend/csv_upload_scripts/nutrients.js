// import { downloadCSV } from common;
import { db } from '../models';
import { cleanString } from './common';
const fs = require('fs');
const csv = require('csv-parser');

function updateNutrients(nutrientsList) {
  // Individually update nutrients.
  // Doesn't appear to be a way to bulk update
  // distinct values.
  if (nutrientsList.length === 0) return;
  nutrientsList.map((nutrient) => {
    db.Nutrient.update(nutrient, {
      returning: true,
      where: { id: nutrient.id },
    }).then((nutrients) => {
      console.log(
        `Nutrient records updated: ${nutrientsList.map((nutrient) => {
          return nutrient.name;
        })}`
      );
      return nutrients;
    });
  });
}

function createNewNutrients(nutrientsList) {
  // Bulk create nutrients.
  if (nutrientsList.length === 0) return;
  db.Nutrient.bulkCreate(nutrientsList).then((nutrients) => {
    console.log(
      `Nutrient records created: ${nutrientsList.map((nutrient) => {
        return nutrient.name;
      })}`
    );
    return nutrients;
  });
}

export async function uploadNutrients(file) {
  let nutrients = await db.Nutrient.findAll({
    include: [
      {
        model: db.Food,
        through: {},
        as: 'foods',
      },
    ],
  });
  var nutrientsByName = nutrients.reduce(function (map, nutrient) {
    map[cleanString(nutrient.name)] = nutrient;
    return map;
  }, {});
  const nutrientsToUpdate = [];
  const nutrientsToCreate = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (nutrient) => {
      const savedNutrient = nutrientsByName[cleanString(nutrient.name)];
      // TODO: add code to validate columns against bad or missing data for each field.
      // Check if nutrient exists. If exists, update, else create new.
      if (savedNutrient) {
        // Only update if a record has changed.
        if (
          !(
            savedNutrient.name === nutrient.name &&
            // Removing trailing 0's:
            parseFloat(savedNutrient.dv_in_mg) ===
              parseFloat(nutrient.dv_in_mg) &&
            savedNutrient.dv_source === nutrient.dv_source &&
            savedNutrient.description === nutrient.description &&
            savedNutrient.description_sources ===
              nutrient.description_sources &&
            savedNutrient.warnings === nutrient.warnings &&
            savedNutrient.warnings_sources === nutrient.warnings_sources &&
            savedNutrient.source_note === nutrient.source_note
          )
        ) {
          let nutrientWithUpdates = nutrient;
          nutrientWithUpdates.id = savedNutrient.id;
          nutrientWithUpdates.dv_in_mg = parseFloat(
            nutrientWithUpdates.dv_in_mg
          );
          // TODO: fix edge case: breaks when csv has two new nutrients with same name.
          nutrientsToUpdate.push(nutrientWithUpdates);
        }
      } else {
        nutrientsToCreate.push(nutrient);
      }
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      // Delete csv from temp files.
      fs.unlinkSync(file.path, (err) => {
        console.error(err);
      });
      console.log('file deleted');
      updateNutrients(nutrientsToUpdate);
      createNewNutrients(nutrientsToCreate);
      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
