import { db } from '../models';
import { cleanString } from '../utils/common';
import { updateNutrients, createNewNutrients } from '../queries/nutrients';
const fs = require('fs');
const csv = require('csv-parser');

function nutrientPropertiesUpdated(oldNutrient, newNutrient) {
  if (
    oldNutrient.name === newNutrient.name &&
    // Removing trailing 0's:
    parseFloat(oldNutrient.dv_in_mg) === parseFloat(newNutrient.dv_in_mg) &&
    oldNutrient.dv_source === newNutrient.dv_source &&
    oldNutrient.description === newNutrient.description &&
    oldNutrient.description_sources === newNutrient.description_sources &&
    oldNutrient.warnings === newNutrient.warnings &&
    oldNutrient.warnings_sources === newNutrient.warnings_sources &&
    oldNutrient.source_note === newNutrient.source_note
  )
    return false;
  return true;
}

export async function uploadNutrients(file) {
  // csv required columns:
  // name, dv_in_mg, dv_source
  // csv optional columns:
  // description, description_sources, warnings, warings_sources, source_note

  // TODO: check document headers and return error if not up to specs.

  // Get all nutrients from db.
  let nutrients = await db.Nutrient.findAll({});

  // Sort existing nutrients by name.
  var nutrientsByName = nutrients.reduce(function (map, nutrient) {
    map[cleanString(nutrient.name)] = nutrient;
    return map;
  }, {});
  const nutrientsToUpdate = [];
  const nutrientsToCreate = [];

  // Unpack csv data by nutrient row.
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (nutrient) => {
      const savedNutrient = nutrientsByName[cleanString(nutrient.name)];
      // TODO: add code to validate columns against bad or missing data for each field.

      // Check if nutrient exists. If exists, update, else create new.
      if (savedNutrient) {
        // Don't update record if no changes have been made.
        if (!nutrientPropertiesUpdated(savedNutrient, nutrient)) return;
        // If nutrient exists and has udpdated properties, add to nutrientsToUpdate list.
        let nutrientWithUpdates = nutrient;
        nutrientWithUpdates.id = savedNutrient.id;
        nutrientWithUpdates.dv_in_mg = parseFloat(nutrientWithUpdates.dv_in_mg);
        nutrientsToUpdate.push(nutrientWithUpdates);
      } else {
        // If nutrient doesn't exit, add to nutrientsToCreate list.
        // TODO: fix edge case: breaks when csv has two new nutrients with same name.
        nutrientsToCreate.push(nutrient);
      }
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      // Delete csv from tmp/csv
      fs.unlinkSync(file.path, (err) => {
        console.error(err);
      });
      console.log('file deleted');

      // Update nutrientsToUpdate list.
      if (nutrientsToUpdate.length > 0)
        return updateNutrients(nutrientsToUpdate);
      // Create nutrientsToCreate list.
      if (nutrientsToCreate.length > 0)
        return createNewNutrients(nutrientsToCreate);

      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
