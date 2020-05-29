// import { downloadCSV } from common;
import { db } from '../models';
import { cleanString } from './common';
const fs = require('fs');
const csv = require('csv-parser');

function updateNutrients(nutrientsToUpdate) {
  // Bulk update nutrients.
  return 'success';
}

function createNewNutrients(nutrientsList) {
  // Bulk create nutrients.
  db.Nutrient.bulkCreate(nutrientsList).then(() => {
    return 'success';
  });
  return 'success';
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
  // const nutrientsWithInvalidDate = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (nutrient) => {
      const savedNutrient = nutrientsByName[cleanString(nutrient.name)];
      // Check if nutrient exists. If exists, update, else create new.
      if (savedNutrient) {
        // Only update if a record has changed.
        if (
          savedNutrient.name === nutrient.name &&
          savedNutrient.dv_in_mg === nutrient.dv_in_mg &&
          savedNutrient.dv_source === nutrient.dv_source &&
          savedNutrient.description === nutrient.description &&
          savedNutrient.description_sources === nutrient.description_sources &&
          savedNutrient.warnings === nutrient.warnings &&
          savedNutrient.warnings_sources === nutrient.warnings_sources &&
          savedNutrient.source_note === nutrient.source_note
        )
          return;
        let nutrientWithUpdates = nutrient;
        nutrientWithUpdates.id = savedNutrient.id;
        nutrientsToUpdate.push(nutrientWithUpdates);
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
    });
}
