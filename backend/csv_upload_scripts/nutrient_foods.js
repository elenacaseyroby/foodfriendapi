const { db } = require('../models');
const { cleanString } = require('../utils/common');
const fs = require('fs');
const csv = require('csv-parser');

async function uploadNutrientFoods(file) {
  // WARNING: must upload nutrients before uploading nutrientFoods.
  // this will add/update/delete nutrientFood records.
  // will fully sync all the records in the csv to the db: adding/updating
  // what's included and deleting what's not.

  // Adds/Updates nutrientFood and Food records.

  // csv required columns:
  // nutrientName, foodName, percentDvPerServing, dvSource
  // nutrientsList should be comma separated list of nutrient names.

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
        savedNutrientsByName[cleanString(nutrientFood.nutrientName)];
      if (!nutrient) {
        console.log(
          `nutrient under name: ${nutrientFood.nutrientName} not found.`
        );
        return;
      }

      // Get existing food record.
      const food = savedFoodsByName[cleanString(nutrientFood.foodName)];

      // If no food record, add food name to list to create later.
      if (
        !listOfFoodNamesTouched.includes(cleanString(nutrientFood.foodName))
      ) {
        listOfFoodNamesTouched.push(cleanString(nutrientFood.foodName));
        if (!food) {
          foodsToCreate.push({ name: nutrientFood.foodName });
        } else if (food.name.trim() !== nutrientFood.foodName.trim()) {
          // If name updated, add to list to be updated later.
          foodsToUpdate.push({
            id: food.id,
            name: nutrientFood.foodName,
          });
        }
      }

      // If nutrientId key not created, creat it.
      if (!nutrientFoodsByNutrientId[nutrient.id])
        nutrientFoodsByNutrientId[nutrient.id] = [];
      // Add food name to array under nutrientId key in dict.
      nutrientFoodsByNutrientId[nutrient.id].push({
        nutrientId:
          savedNutrientsByName[cleanString(nutrientFood.nutrientName)].id,
        foodId: savedFoodsByName[cleanString(nutrientFood.foodName)]
          ? savedFoodsByName[cleanString(nutrientFood.foodName)].id
          : null,
        foodName: nutrientFood.foodName,
        percentDvPerServing: nutrientFood.percentDvPerServing,
        dvSource: nutrientFood.dvSource,
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
          if (!map[nutrientFood.nutrientId]) map[nutrientFood.nutrientId] = [];
          map[nutrientFood.nutrientId].push(nutrientFood);
          return map;
        },
        {}
      );
      // Update nutrientFood records by nutrient.
      for (var nutrientId in nutrientFoodsByNutrientId) {
        const nutrientFoods = nutrientFoodsByNutrientId[nutrientId];
        // Delete nutrients not in csv.
        const csvFoodIds = nutrientFoods.map((nutrientFood) => {
          return nutrientFood.foodId;
        });
        if (!savedNutrientFoodsByNutrientId[nutrientId])
          savedNutrientFoodsByNutrientId[nutrientId] = [];

        const savedFoodIds =
          savedNutrientFoodsByNutrientId[nutrientId].map((nutrientFood) => {
            return nutrientFood.foodId;
          }) || [];
        if (!savedNutrientFoodsByNutrientId[nutrientId])
          savedNutrientFoodsByNutrientId[nutrientId] = [];
        savedNutrientFoodsByNutrientId[nutrientId].map((nutrientFood) => {
          if (csvFoodIds.includes(nutrientFood.foodId)) return;
          db.NutrientFood.destroy({
            where: {
              nutrientId: nutrientId,
              foodId: nutrientFood.foodId,
            },
          });
        });
        // Create nutrientfoods in csv but not saved.
        let nutrientFoodIdPairsTouched = [];
        nutrientFoods.map((nutrientFood) => {
          if (savedFoodIds.includes(nutrientFood.foodId)) {
            // If nutrientfood in csv and saved, update nutrients in csv and saved.
            let savedRecord;
            savedNutrientFoodsByNutrientId[nutrientId].map(
              (savedNutrientFood) => {
                if (savedNutrientFood.foodId !== nutrientFood.foodId) return;
                savedRecord = savedNutrientFood;
              }
            );
            if (
              savedRecord.percentDvPerServing ===
                nutrientFood.percentDvPerServing &&
              savedRecord.dvSource === nutrientFood.dvSource
            )
              return;
            db.NutrientFood.update(
              {
                percentDvPerServing: nutrientFood.percentDvPerServing,
                dvSource: nutrientFood.dvSource,
              },
              {
                where: {
                  nutrientId: savedRecord.nutrientId,
                  foodId: savedRecord.foodId,
                },
              }
            );
            return;
          }
          // Else create new nutrientfood record. If new food record, get new food id.
          let foodId = nutrientFood.foodId;
          let food = null;
          if (!foodId) {
            food = newFoodsByName[nutrientFood.foodName];
            if (!food) {
              console.log(`food not found by name: ${nutrientFood.foodName}`);
              return;
            }
            foodId = food.id;
          }
          const pair = foodId.toString() + ' - ' + nutrientFood.nutrientId;
          if (nutrientFoodIdPairsTouched.includes(pair)) {
            console.log(`foodId - nutrient id pair already exists: ${pair}`);
            return;
          }
          nutrientFoodIdPairsTouched.push(pair);
          db.NutrientFood.create({
            nutrientId: nutrientFood.nutrientId,
            foodId: foodId,
            percentDvPerServing: nutrientFood.percentDvPerServing,
            dvSource: nutrientFood.dvSource,
          });
        });
      }

      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}

module.exports = { uploadNutrientFoods };
