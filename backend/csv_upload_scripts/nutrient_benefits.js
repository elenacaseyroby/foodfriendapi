import { db } from '../models';
import { cleanString } from '../utils/common';
import { updateBenefitNutrients } from '../services/models/benefits';
const fs = require('fs');
const csv = require('csv-parser');

export async function uploadNutrientBenefits(file) {
  // WARNING: must upload nutrients before uploading nutrientBenefits.

  // Adds/Updates nutrientBenefits and benefits records.

  // csv required columns:
  // benefitName, nutrientsList
  // nutrientsList should be a string.  Within that string should be a
  // comma separated list of nutrient names.

  // Get all benefits by name from db.
  let benefits = await db.Benefit.findAll({});
  let benefitsByName = benefits.reduce(function (map, benefit) {
    map[cleanString(benefit.name)] = benefit;
    return map;
  }, {});
  // Get all nutrients by name from db.
  let nutrients = await db.Nutrient.findAll({});
  let nutrientsByName = nutrients.reduce(function (map, nutrient) {
    map[cleanString(nutrient.name)] = nutrient;
    return map;
  }, {});
  let benefitNutrientsToUpdate = [];
  let benefitsToCreate = [];
  let benefitsToUpdate = [];
  // Unpack csv data by benefit row.
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (benefit) => {
      // TODO: add code to validate columns against bad or missing data for each field.

      // Check if benefit exists. If exists, update, else create new.
      const savedBenefit = benefitsByName[cleanString(benefit.benefitName)];
      if (savedBenefit) {
        // Put benefit nutrients in list to be updated.
        let benefitNutrientIdsList = [];
        if (benefit.nutrientsList) {
          benefitNutrientIdsList = benefit.nutrientsList
            .replace(/"/g, '')
            .split(',')
            .map((nutrientName) => {
              const cleanName = cleanString(nutrientName);
              if (nutrientsByName[cleanName])
                return nutrientsByName[cleanName].id;
              console.log(
                `nutrient name ${nutrientName} not synced with benefit ${benefit.benefitName}`
              );
            })
            .filter((nutrientId) => !!nutrientId);
        }
        benefitNutrientsToUpdate.push({
          benefitName: benefit.benefitName,
          nutrientIds: benefitNutrientIdsList,
        });
        // Don't update benefit record if no changes have been made.
        if (savedBenefit.name === benefit.benefitName) return;
        // Add benefit to list to be updated.
        benefitsToUpdate.push({
          id: savedBenefit.id,
          name: benefit.benefitName,
        });
      } else {
        // If benefit doesn't exit, add to benefitsToCreate list.
        // TODO: fix edge case: breaks when csv has two new benefits with same name.
        const newBenefit = { name: benefit.benefitName };
        benefitsToCreate.push(newBenefit);
        let benefitNutrientIdsList = [];
        if (benefit.nutrientsList) {
          benefitNutrientIdsList = benefit.nutrientsList
            .replace(/"/g, '')
            .split(',')
            .map((nutrientName) => {
              const cleanName = cleanString(nutrientName);
              if (nutrientsByName[cleanName])
                return nutrientsByName[cleanName].id;
            })
            .filter((nutrientId) => !!nutrientId);
        }
        benefitNutrientsToUpdate.push({
          benefitName: benefit.benefitName,
          nutrientIds: benefitNutrientIdsList,
        });
      }
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      // Delete csv from tmp/csv
      fs.unlinkSync(file.path, (err) => {
        console.error(err);
      });
      console.log('file deleted');

      // Update benefits.
      const updatedBenefits = await benefitsToUpdate.map((benefit) => {
        db.Benefit.update(benefit, {
          returning: true,
          where: { id: benefit.id },
        });
      });

      // Create New Benefits
      const newBenefits = await db.Benefit.bulkCreate(benefitsToCreate);

      console.log(`${updatedBenefits.length} benefits updated.`);
      console.log(`${newBenefits.length} benefits created.`);

      // Sort existing and new benefits by name.
      const benefits = await db.Benefit.findAll({});
      const benefitsByName = benefits.reduce(function (map, benefit) {
        map[benefit.name] = benefit;
        return map;
      }, {});
      // Update NutrientBenefit records.
      benefitNutrientsToUpdate.map((benefitNutrients) => {
        if (!benefitsByName[benefitNutrients.benefitName]) return;
        const benefitId = benefitsByName[benefitNutrients.benefitName].id;
        const nutrientIdsList = benefitNutrients.nutrientIds;
        return updateBenefitNutrients(benefitId, nutrientIdsList);
      });
      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
