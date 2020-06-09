import { db } from '../models';
import { cleanString } from './common';
import { differenceOfTwoArrays } from '../utils/common';
const fs = require('fs');
const csv = require('csv-parser');

export async function uploadNutrientRecipes(file) {
  // WARNING: must upload nutrients before uploading nutrientBenefits.
  // this will only add/update nutrient_recipes and recipes records.

  // Adds/Updates nutrient_recipes and recipes records.

  // csv required columns:
  // recipe_name,	url,	image_path,	trackable_foods,	source_note
  // nutrients_list should be comma separated list of nutrient names.

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
        nutrientsByName[cleanString(nutrientRecipe.nutrient_name)];
      if (!nutrient) {
        return;
      }
      if (!recipeUrlsByNutrientId[nutrient.id])
        recipeUrlsByNutrientId[nutrient.id] = [];
      recipeUrlsByNutrientId[nutrient.id].push(nutrientRecipe.url.trim());
      const recipe = recipesByUrl[nutrientRecipe.url.trim()];
      if (urlsTouched.includes(nutrientRecipe.url.trim())) {
        return;
      }
      if (recipe) {
        if (
          recipe.name !== nutrientRecipe.recipe_name ||
          recipe.image_path !== nutrientRecipe.image_path ||
          recipe.trackable_foods !== nutrientRecipe.trackable_foods ||
          recipe.source_note !== nutrientRecipe.source_note
        ) {
          recipesToUpdate.push({
            id: recipe.id,
            name: nutrientRecipe.recipe_name,
            url: nutrientRecipe.url.trim(),
            image_path: nutrientRecipe.image_path,
            trackable_foods: nutrientRecipe.trackable_foods,
            source_note: nutrientRecipe.source_note,
          });
        }
      } else {
        recipesToCreate.push({
          name: nutrientRecipe.recipe_name,
          url: nutrientRecipe.url.trim(),
          image_path: nutrientRecipe.image_path,
          trackable_foods: nutrientRecipe.trackable_foods,
          source_note: nutrientRecipe.source_note,
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
            image_path: recipe.image_path,
            trackable_foods: recipe.trackable_foods,
            source_note: recipe.source_note,
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
      const savedRecipeUrlsByNutrientID = {};
      nutrientRecipes.map((nutrient) => {
        if (!savedRecipeUrlsByNutrientID[nutrient.id])
          savedRecipeUrlsByNutrientID[nutrient.id] = [];
        nutrient.recipes.map((recipe) => {
          savedRecipeUrlsByNutrientID[nutrient.id].push(recipe.url.trim());
        });
      });

      // Add NutrientRecipes records.
      nutrients.forEach((nutrient) => {
        let nutrientRecipesToCreate = differenceOfTwoArrays(
          recipeUrlsByNutrientId[nutrient.id] || [],
          savedRecipeUrlsByNutrientID[nutrient.id] || []
        ).map((url) => {
          return {
            recipe_id: recipesByUrl[url.trim()].id,
            nutrient_id: nutrient.id,
          };
        });
        db.NutrientRecipe.bulkCreate(nutrientRecipesToCreate);
      });

      // TODO: return nutrient rows that could not be created/updated
      // because of bad or missing data.
    });
}
