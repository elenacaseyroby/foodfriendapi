import { db } from '../models';
import { cleanString } from '../utils/common';
import { differenceOfTwoArrays } from '../utils/common';
const fs = require('fs');
const csv = require('csv-parser');

export async function uploadNutrientRecipes(file) {
  // WARNING: must upload nutrients before uploading nutrientBenefits.
  // this will only add/update nutrientRecipes and recipes records.

  // Adds/Updates nutrientRecipes and recipes records.

  // csv required columns:
  // recipeName,	url,	imagePath,	trackableFoods,	sourceNote
  // nutrientsList should be comma separated list of nutrient names.

  // Get all recipes by name from db.
  let recipes = await db.Recipe.findAll({});
  let recipesByUrl = recipes.reduce(function (map, recipe) {
    map[recipe.url.trim()] = recipe;
    return map;
  }, {});

  // Get all nutrients by name from db.
  const nutrients = await db.Nutrient.findAll({});
  const nutrientsByName = nutrients.reduce(function (map, nutrient) {
    map[cleanString(nutrient.name)] = nutrient;
    return map;
  }, {});
  let urlsTouched = [];
  let recipesToCreate = [];
  let recipesToUpdate = [];
  let recipeUrlsByNutrientId = [];
  // Unpack csv data by benefit row.
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (nutrientRecipe) => {
      // TODO: add code to validate columns against bad or missing data for each field.
      const nutrient =
        nutrientsByName[cleanString(nutrientRecipe.nutrientName)];
      if (!nutrient) {
        return;
      }
      // if nutrient id not yet in dict, add it
      if (!recipeUrlsByNutrientId[nutrient.id])
        recipeUrlsByNutrientId[nutrient.id] = [];
      // if url not already in list for given nutrient id, add it.
      if (
        !recipeUrlsByNutrientId[nutrient.id].includes(nutrientRecipe.url.trim())
      ) {
        recipeUrlsByNutrientId[nutrient.id].push(nutrientRecipe.url.trim());
      }
      const recipe = recipesByUrl[nutrientRecipe.url.trim()];
      if (urlsTouched.includes(nutrientRecipe.url.trim())) {
        return;
      }
      if (recipe) {
        if (
          recipe.name !== nutrientRecipe.recipeName ||
          recipe.imagePath !== nutrientRecipe.imagePath ||
          recipe.trackableFoods !== nutrientRecipe.trackableFoods ||
          recipe.sourceNote !== nutrientRecipe.sourceNote
        ) {
          recipesToUpdate.push({
            id: recipe.id,
            name: nutrientRecipe.recipeName,
            url: nutrientRecipe.url.trim(),
            imagePath: nutrientRecipe.imagePath,
            trackableFoods: nutrientRecipe.trackableFoods,
            sourceNote: nutrientRecipe.sourceNote,
          });
        }
      } else {
        recipesToCreate.push({
          name: nutrientRecipe.recipeName,
          url: nutrientRecipe.url.trim(),
          imagePath: nutrientRecipe.imagePath,
          trackableFoods: nutrientRecipe.trackableFoods,
          sourceNote: nutrientRecipe.sourceNote,
        });
      }
      urlsTouched.push(nutrientRecipe.url.trim());
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      // Delete csv from tmp/csv
      fs.unlinkSync(file.path, (err) => {
        console.error(err);
      });
      console.log('file deleted');

      // Create new recipes.
      const newRecipes = await db.Recipe.bulkCreate(recipesToCreate);

      // Update existing recipes.
      const updatedRecipes = await recipesToUpdate.map((recipe) => {
        db.Recipe.update(
          {
            name: recipe.name,
            url: recipe.url,
            imagePath: recipe.imagePath,
            trackableFoods: recipe.trackableFoods,
            sourceNote: recipe.sourceNote,
          },
          {
            where: {
              id: recipe.id,
            },
          }
        );
      });

      if (newRecipes) console.log(`${newRecipes.length} new recipes created.`);
      if (updatedRecipes)
        console.log(`${updatedRecipes.length} existing recipes updated.`);

      // Get list of saved recipe urls by url.
      let recipes = await db.Recipe.findAll({});
      let recipesByUrl = recipes.reduce(function (map, recipe) {
        map[recipe.url.trim()] = recipe;
        return map;
      }, {});

      // Get list of saved recipe urls by nutrientId.
      const nutrientRecipes = await db.Nutrient.findAll({
        include: [
          {
            model: db.Recipe,
            through: {},
            as: 'recipes',
          },
        ],
      });
      const savedRecipeUrlsByNutrientId = {};
      nutrientRecipes.map((nutrient) => {
        if (!savedRecipeUrlsByNutrientId[nutrient.id])
          savedRecipeUrlsByNutrientId[nutrient.id] = [];
        nutrient.recipes.map((recipe) => {
          savedRecipeUrlsByNutrientId[nutrient.id].push(recipe.url.trim());
        });
      });

      // Add NutrientRecipes records.
      nutrients.forEach((nutrient) => {
        let nutrientRecipesToCreate = differenceOfTwoArrays(
          recipeUrlsByNutrientId[nutrient.id] || [],
          savedRecipeUrlsByNutrientId[nutrient.id] || []
        ).map((url) => {
          return {
            recipeId: recipesByUrl[url.trim()].id,
            nutrientId: nutrient.id,
          };
        });
        db.NutrientRecipe.bulkCreate(nutrientRecipesToCreate);
      });

      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
