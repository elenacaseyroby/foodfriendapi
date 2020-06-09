import { db } from '../models';
import { cleanString } from './common';
import { differenceOfTwoArrays, unionOfTwoArrays } from '../utils/common';
import { deleteNutrientFoodsNotInList } from '../queries/nutrients';
import e from 'express';
const fs = require('fs');
const csv = require('csv-parser');

export async function uploadNutrientFoods(file) {
  // WARNING: must upload nutrients before uploading nutrientFoods.
  // this will add/update/delete nutrient_food records.
  // will fully sync all the records in the csv to the db: adding/updating
  // what's included and deleting what's not.

  // Adds/Updates nutrient_foods and foods records.

  // csv required columns:
  // nutrient_name, food_name, percent_dv_per_serving, dv_source
  // nutrients_list should be comma separated list of nutrient names.

  // Get all benefits by name from db.
  const savedFoods = await db.Food.findAll({});
  const savedFoodsByName = savedFoods.reduce(function (map, food) {
    map[cleanString(food.name)] = food;
    return map;
  }, {});

  // Get all nutrients by name from db.
  const savedNutrients = await db.Nutrient.findAll({});
  const savedNutrientsByName = savedNutrients.reduce(function (map, nutrient) {
    map[cleanString(nutrient.name)] = nutrient;
    return map;
  }, {});

  const savedNutrientFoods = await db.NutrientFood.findAll({});

  let listOfFoodNamesTouched = [];
  let foodsToCreate = [];
  let foodsToUpdate = [];
  let nutrientFoodsByNutrientId = {};
  // Unpack csv data by benefit row.
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (nutrientFood) => {
      // TODO: add code to validate columns against bad or missing data for each field.

      // Get existing nutrient record. Skip row if record not found.
      const nutrient =
        savedNutrientsByName[cleanString(nutrientFood.nutrient_name)];
      if (!nutrient) {
        console.log(
          `nutrient under name: ${nutrientFood.nutrient_name} not found.`
        );
        return;
      }

      // Get existing food record.
      const food = savedFoodsByName[cleanString(nutrientFood.food_name)];

      // If no food record, add food name to list to create later.
      if (
        !listOfFoodNamesTouched.includes(cleanString(nutrientFood.food_name))
      ) {
        listOfFoodNamesTouched.push(cleanString(nutrientFood.food_name));
        if (!food) {
          foodsToCreate.push({ name: nutrientFood.food_name });
        } else if (food.name.trim() !== nutrientFood.food_name.trim()) {
          // If name updated, add to list to be updated later.
          foodsToUpdate.push({
            id: food.id,
            name: nutrientFood.food_name,
          });
        }
      }

      // If nutrientId key not created, creat it.
      if (!nutrientFoodsByNutrientId[nutrient.id])
        nutrientFoodsByNutrientId[nutrient.id] = [];
      // Add food name to array under nutrientId key in dict.
      nutrientFoodsByNutrientId[nutrient.id].push({
        nutrient_id:
          savedNutrientsByName[cleanString(nutrientFood.nutrient_name)].id,
        food_id: savedFoodsByName[cleanString(nutrientFood.food_name)]
          ? savedFoodsByName[cleanString(nutrientFood.food_name)].id
          : null,
        food_name: nutrientFood.food_name,
        percent_dv_per_serving: nutrientFood.percent_dv_per_serving,
        dv_source: nutrientFood.dv_source,
      });
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      // Delete csv from tmp/csv
      fs.unlinkSync(file.path, (err) => {
        console.error(err);
      });
      console.log('file deleted');

      // Create new Foods.
      const newFoods = await db.Food.bulkCreate(foodsToCreate);
      const newFoodsByName = newFoods.reduce((map, food) => {
        map[food.name] = food;
        return map;
      }, {});

      // Update existing Foods.
      const updatedFoods = await foodsToUpdate.map((food) => {
        db.Food.update(food, {
          where: {
            id: food.id,
          },
        });
      });
      if (newFoods) console.log(`${newFoods.length} new foods created.`);
      if (updatedFoods)
        console.log(`${updatedFoods.length} existing foods updated.`);

      // Update nutrientfood records.
      // Sort NutrientFoods into savedFoodNameByNutrientId.
      const savedNutrientFoodsByNutrientId = savedNutrientFoods.reduce(
        (map, nutrientFood) => {
          if (!map[nutrientFood.nutrient_id])
            map[nutrientFood.nutrient_id] = [];
          map[nutrientFood.nutrient_id].push(nutrientFood);
          return map;
        },
        {}
      );
      // Update nutrientFood records by nutrient.
      for (var nutrientId in nutrientFoodsByNutrientId) {
        const nutrientFoods = nutrientFoodsByNutrientId[nutrientId];
        // Delete nutrients not in csv.
        const csvFoodIds = nutrientFoods.map((nutrientFood) => {
          return nutrientFood.food_id;
        });
        if (!savedNutrientFoodsByNutrientId[nutrientId])
          savedNutrientFoodsByNutrientId[nutrientId] = [];

        const savedFoodIds =
          savedNutrientFoodsByNutrientId[nutrientId].map((nutrientFood) => {
            return nutrientFood.food_id;
          }) || [];
        if (!savedNutrientFoodsByNutrientId[nutrientId])
          savedNutrientFoodsByNutrientId[nutrientId] = [];
        savedNutrientFoodsByNutrientId[nutrientId].map((nutrientFood) => {
          if (csvFoodIds.includes(nutrientFood.food_id)) return;
          db.NutrientFood.destroy({
            where: {
              nutrient_id: nutrientId,
              food_id: nutrientFood.food_id,
            },
          });
        });
        // Create nutrientfoods in csv but not saved.
        let nutrientFoodIdPairsTouched = [];
        nutrientFoods.map((nutrientFood) => {
          if (savedFoodIds.includes(nutrientFood.food_id)) {
            // If nutrientfood in csv and saved, update nutrients in csv and saved.
            let savedRecord;
            savedNutrientFoodsByNutrientId[nutrientId].map(
              (savedNutrientFood) => {
                if (savedNutrientFood.food_id !== nutrientFood.food_id) return;
                savedRecord = savedNutrientFood;
              }
            );
            if (
              savedRecord.percent_dv_per_serving ===
                nutrientFood.percent_dv_per_serving &&
              savedRecord.dv_source === nutrientFood.dv_source
            )
              return;
            db.NutrientFood.update(
              {
                percent_dv_per_serving: nutrientFood.percent_dv_per_serving,
                dv_source: nutrientFood.dv_source,
              },
              {
                where: {
                  nutrient_id: savedRecord.nutrient_id,
                  food_id: savedRecord.food_id,
                },
              }
            );
            return;
          }
          // Else create new nutrientfood record. If new food record, get new food id.
          let food_id = nutrientFood.food_id;
          let food = null;
          if (!food_id) {
            food = newFoodsByName[nutrientFood.food_name];
            if (!food) {
              console.log(`food not found by name: ${nutrientFood.food_name}`);
              return;
            }
            food_id = food.id;
          }
          const pair = food_id.toString() + ' - ' + nutrientFood.nutrient_id;
          if (nutrientFoodIdPairsTouched.includes(pair)) {
            console.log(`food_id - nutrient id pair already exists: ${pair}`);
            return;
          }
          nutrientFoodIdPairsTouched.push(pair);
          db.NutrientFood.create({
            nutrient_id: nutrientFood.nutrient_id,
            food_id: food_id,
            percent_dv_per_serving: nutrientFood.percent_dv_per_serving,
            dv_source: nutrientFood.dv_source,
          });
        });
      }

      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
