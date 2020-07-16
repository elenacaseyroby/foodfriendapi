import chai from 'chai';
import { db } from '../../models';

require('dotenv').config();
const Sequelize = require('sequelize');
const { expect } = chai;

describe('userdiet model tests:', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.
    // Create Diets
    const vegan = await db.Diet.create({
      name: 'vegan',
    });
    const glutenFree = await db.Diet.create({
      name: 'gluten-free',
    });
    // Delete user agreements
    const allUserDiets = await db.UserDiet.findAll({});
    allUserDiets.forEach(async (ud) => {
      await ud.destroy();
    });
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
    return vegan && glutenFree;
  });
  after(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete diets
    const allDiets = await db.Diet.findAll({});
    allDiets.forEach(async (d) => {
      await d.destroy();
    });
    // Delete user agreements
    const allUserDiets = await db.UserDiet.findAll({});
    allUserDiets.forEach(async (ud) => {
      await ud.destroy();
    });
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
    return 'success';
  });
  it('user.updateDiets takes list of diet ids and adds/deletes userDiets records to reflect list', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const diets = await db.Diet.findAll({
      where: {
        name: 'vegan',
      },
    });
    // const dietsUpdated = await user.updateDiets(diets);
    // expect(dietsUpdated).to.equal('success');
    const dietsUpdated = await user.updateDiets(diets);
    expect(dietsUpdated).to.equal('success');
    console.log('--------user diets---------');
    const userDiets = await user.getDiets();
    console.log(userDiets);
    expect(userDiets.length).equals(1);
    // any db data created must be destroyed at end of test
    // Delete user agreements
    const allUserDiets = await db.UserDiet.findAll({});
    const userDietsDeleted = await allUserDiets.forEach(async (ud) => {
      await ud.destroy();
    });
    // Delete user
    if (userDietsDeleted) {
      await user.destroy();
    }
  });
});
