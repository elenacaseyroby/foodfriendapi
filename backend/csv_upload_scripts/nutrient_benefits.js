import { db } from '../models';
import { cleanString } from './common';
import {
  createNewBenefits,
  updateBenefits,
  updateBenefitNutrients,
} from '../queries/benefits';
const fs = require('fs');
const csv = require('csv-parser');

export async function uploadNutrientBenefits(file) {
  // csv required columns:
  // benefit_name, nutrients_list
  // nutrients_list should be comma separated list of nutrient names.

  // Get all benefits by name from db.
  let benefits = await db.Benefit.findAll({}).catch((err) => {
    console.log(err);
    throw error;
  });
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
      const savedBenefit = benefitsByName[cleanString(benefit.benefit_name)];
      if (savedBenefit) {
        // Put benefit nutrients in list to be updated.
        let benefitNutrientIdsList = [];
        if (benefit.nutrients_list) {
          benefitNutrientIdsList = benefit.nutrients_list
            .split(',')
            .map((nutrient_name) => {
              const cleanName = cleanString(nutrient_name);
              if (nutrientsByName[cleanName])
                return nutrientsByName[cleanName].id;
            })
            .filter((nutrientId) => !!nutrientId);
        }
        // Bug: Alzheimer's isn't getting it's nutrients synced.
        benefitNutrientsToUpdate.push({
          benefitName: benefit.benefit_name,
          nutrientIds: benefitNutrientIdsList,
        });
        // Don't update benefit record if no changes have been made.
        if (savedBenefit.name === benefit.benefit_name) return;
        // Add benefit to list to be updated.
        benefitsToUpdate.push({
          id: savedBenefit.id,
          name: benefit.benefit_name,
        });
      } else {
        // If benefit doesn't exit, add to benefitsToCreate list.
        // TODO: fix edge case: breaks when csv has two new benefits with same name.
        const newBenefit = { name: benefit.benefit_name };
        benefitsToCreate.push(newBenefit);
        let benefitNutrientIdsList = [];
        if (benefit.nutrients_list) {
          benefitNutrientIdsList = benefit.nutrients_list
            .split(',')
            .map((nutrient_name) => {
              const cleanName = cleanString(nutrient_name);
              if (nutrientsByName[cleanName])
                return nutrientsByName[cleanName].id;
            })
            .filter((nutrientId) => !!nutrientId);
        }
        benefitNutrientsToUpdate.push({
          benefitName: benefit.benefit_name,
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
      if (benefitsToUpdate.length > 0) return updateBenefits(benefitsToUpdate);

      // Create new benefits.
      if (benefitsToCreate.length > 0)
        return createNewBenefits(benefitsToCreate);

      // Get all benefits by name from db.
      let benefits = await db.Benefit.findAll({});

      let benefitsByName = benefits.reduce(function (map, benefit) {
        map[benefit.name] = benefit;
        return map;
      }, {});
      benefitNutrientsToUpdate.map((benefitNutrients) => {
        if (!benefitsByName[benefitNutrients.benefitName]) return;
        const benefitId = benefitsByName[benefitNutrients.benefitName].id;
        const nutrientIdsList = benefitNutrients.nutrientIds;
        updateBenefitNutrients(benefitId, nutrientIdsList);
      });

      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
