import chai from 'chai';
import { db } from '../../models';
import {
  getPathFoods,
  getPathHighPotencyFoods,
} from '../../services/models/paths';

require('dotenv').config();
const Sequelize = require('sequelize');
const { expect } = chai;

describe('paths model and services tests:', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete all PathNutrient records.
    const allPathNutrients = await db.PathNutrient.findAll({});
    allPathNutrients.forEach(async (pn) => {
      await pn.destroy();
    });
    // Delete all NutrientFoods records.
    const allNutrientFoods = await db.NutrientFood.findAll({});
    allNutrientFoods.forEach(async (nf) => {
      await nf.destroy();
    });
    // Delete nutrients.
    const allNutrients = await db.Nutrient.findAll({});
    allNutrients.forEach(async (n) => {
      await n.destroy();
    });
    // Delete foods.
    const allFoods = await db.Food.findAll({});
    allFoods.forEach(async (f) => {
      await f.destroy();
    });
    // Delete paths.
    const allPaths = await db.Path.findAll({});
    allPaths.forEach(async (p) => {
      await p.destroy();
    });
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
  });
  after(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete all PathNutrient records.
    const allPathNutrients = await db.PathNutrient.findAll({});
    allPathNutrients.forEach(async (pn) => {
      await pn.destroy();
    });
    // Delete all NutrientFoods records.
    const allNutrientFoods = await db.NutrientFood.findAll({});
    allNutrientFoods.forEach(async (nf) => {
      await nf.destroy();
    });
    // Delete nutrients.
    const allNutrients = await db.Nutrient.findAll({});
    allNutrients.forEach(async (n) => {
      await n.destroy();
    });
    // Delete foods.
    const allFoods = await db.Food.findAll({});
    allFoods.forEach(async (f) => {
      await f.destroy();
    });
    // Delete paths.
    const allPaths = await db.Path.findAll({});
    allPaths.forEach(async (p) => {
      await p.destroy();
    });
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
  });
  it('getPathHighPotencyFoods returns only foods in all nutrients in a given path', async () => {
    //  Create owner
    const owner = await db.User.create({
      firstName: 'test',
      lastName: 'test',
      email: 'owner@owner.edu',
    });
    // Create path
    const path = await db.Path.create({
      name: 'myPath',
      ownerId: owner.id,
      themeId: 1,
    });
    // Create nutrients
    const nutrient1 = await db.Nutrient.create({
      name: 'nutrient1',
      dvInMg: 0.5,
      dvSource: 'kladf',
    });
    const nutrient2 = await db.Nutrient.create({
      name: 'nutrient2',
      dvInMg: 0.5,
      dvSource: 'kladf',
    });
    const nutrient3 = await db.Nutrient.create({
      name: 'nutrient3',
      dvInMg: 0.5,
      dvSource: 'kladf',
    });
    // Create foods
    const foodWithAllNutrients = await db.Food.create({
      name: 'foodWithAllNutrients',
    });
    const foodWithAllNutrients2 = await db.Food.create({
      name: 'foodWithAllNutrients2',
    });
    const foodWith1Nutrient = await db.Food.create({
      name: 'foodWith1Nutrient',
    });
    const foodWith2Nutrients = await db.Food.create({
      name: 'foodWith2Nutrients',
    });
    // Add nutrients
    path.addNutrients([nutrient1, nutrient2, nutrient3]);
    // Add foods
    // nutrient1.addFoods([
    //   foodWithAllNutrients,
    //   foodWithAllNutrients2,
    //   foodWith1Nutrient,
    //   foodWith2Nutrients,
    // ]);
    // nutrient2.addFoods([
    //   foodWithAllNutrients,
    //   foodWithAllNutrients2,
    //   foodWith2Nutrients,
    // ]);
    // nutrient3.addFoods([foodWithAllNutrients, foodWithAllNutrients2]);
    // Add foods to nutrients.
    const nutrient1Foods = [
      foodWithAllNutrients,
      foodWithAllNutrients2,
      foodWith1Nutrient,
      foodWith2Nutrients,
    ].map((food) => {
      return {
        nutrientId: nutrient1.id,
        foodId: food.id,
        dvSource: 'asdklfj',
        percentDvPerServing: 0.5,
      };
    });
    const nutrient1FoodsUpdated = await db.NutrientFood.bulkCreate(
      nutrient1Foods
    );

    const nutrient2Foods = [
      foodWithAllNutrients,
      foodWithAllNutrients2,
      foodWith2Nutrients,
    ].map((food) => {
      return {
        nutrientId: nutrient2.id,
        foodId: food.id,
        dvSource: 'asdklfj',
        percentDvPerServing: 0.5,
      };
    });
    const nutrient2FoodsUpdated = await db.NutrientFood.bulkCreate(
      nutrient2Foods
    );

    const nutrient3Foods = [foodWithAllNutrients, foodWithAllNutrients2].map(
      (food) => {
        return {
          nutrientId: nutrient3.id,
          foodId: food.id,
          dvSource: 'asdklfj',
          percentDvPerServing: 0.5,
        };
      }
    );
    const nutrient3FoodsUpdated = await db.NutrientFood.bulkCreate(
      nutrient3Foods
    );

    if (
      nutrient1FoodsUpdated &&
      nutrient2FoodsUpdated &&
      nutrient3FoodsUpdated
    ) {
      const highPotencyFoods = await getPathHighPotencyFoods(path.id);
      const highPotencyFoodNames = highPotencyFoods.map((food) => {
        return food.name;
      });
      expect(highPotencyFoodNames.includes('foodWithAllNutrients')).is.true;
      expect(highPotencyFoodNames.includes('foodWithAllNutrients2')).is.true;
      expect(highPotencyFoodNames.includes('foodWith1Nutrient')).is.false;
      expect(highPotencyFoodNames.includes('foodWith2Nutrients')).is.false;
    }

    //any db data created must be destroyed at end of test
    // foodWith2Nutrients.destroy();
    // foodWith1Nutrient.destroy();
    // foodWithAllNutrients2.destroy();
    // foodWithAllNutrients.destroy();
    // nutrient3.destroy();
    // nutrient2.destroy();
    // nutrient1.destroy();
    // owner.destroy();
  });
  // also test that cascade delete means that it deletes *only* the explicit parent record and its join records.
});
