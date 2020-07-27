import chai from 'chai';
import { db } from '../../models';

require('dotenv').config();
const Sequelize = require('sequelize');
const { expect } = chai;

describe('userdiet model tests:', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.
    // Create Diets
    let vegan = await db.Diet.findOne({
      where: {
        name: 'vegan',
      },
    });
    if (!vegan) {
      vegan = await db.Diet.create({
        name: 'vegan',
      });
    }
    let glutenFree = await db.Diet.findOne({
      where: {
        name: 'gluten-free',
      },
    });
    if (!glutenFree) {
      glutenFree = await db.Diet.create({
        name: 'gluten-free',
      });
    }
    // Delete user diets
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
    const allDietsDeleted = await allDiets.forEach(async (d) => {
      await d.destroy();
    });
    // Delete user diets
    const allUserDiets = await db.UserDiet.findAll({});
    allUserDiets.forEach(async (ud) => {
      await ud.destroy();
    });
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
    return allDietsDeleted;
  });
  it('add diet to user using user.addDiet', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const diet = await db.Diet.findOne({
      where: {
        name: 'vegan',
      },
    });
    const dietUpdated = await user.addDiet(diet);
    expect(dietUpdated).to.not.be.undefined;
    const userDiets = await user.getDiets(); // array of diet objects
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
  it('add multiple diets to user using user.addDiets', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet2@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const diets = await db.Diet.findAll({});
    const dietsAdded = await user.addDiets(diets);
    console.log(`dietsAdded: ${dietsAdded}`);
    const userDiets = await user.getDiets(); // array of diet objects
    expect(userDiets.length).equals(diets.length);
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
  it('remove multiple diets from user using user.removeDiets', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet3@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const diets = await db.Diet.findAll({});
    const dietsAdded = await user.addDiets(diets);
    expect(dietsAdded).to.not.be.undefined;
    let userDiets = await user.getDiets(); // array of diet objects
    expect(userDiets.length).equals(diets.length);
    const dietsRemoved = await user.removeDiets(diets);
    expect(dietsRemoved).to.not.be.undefined;
    userDiets = await user.getDiets(); // array of diet objects
    expect(userDiets.length).equals(0);

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
  it("can't remove one diet from user with removeDiets", async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet4@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const diets = await db.Diet.findAll({});
    const dietsAdded = await user.addDiets(diets);
    expect(dietsAdded).to.not.be.undefined;
    let userDiets = await user.getDiets(); // array of diet objects
    expect(userDiets.length).equals(diets.length);
    const veganDiets = db.Diet.findAll({
      where: {
        name: 'vegan',
      },
    });
    let fail = true;
    try {
      const dietsRemoved = await user.removeDiets(veganDiets);
      fail = false;
    } catch (error) {
      fail = true;
    }
    expect(fail).to.be.true;

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
  it('add multiple diets to user using user.updateDiets', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet5@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const diets = await db.Diet.findAll({});
    const dietsAdded = await user.updateDiets(diets);
    expect(dietsAdded).to.equal('success');
    const userDiets = await user.getDiets(); // array of diet objects
    expect(userDiets.length).equals(diets.length);
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
  it('delete diet from user using user.updateDiets', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'diet6@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    // Add all diets to user.
    let diets = await db.Diet.findAll({});
    let dietsAdded = await user.addDiets(diets);
    expect(dietsAdded).to.not.be.undefined;
    let userDiets = await user.getDiets(); // array of diet objects
    expect(userDiets.length).equals(diets.length);

    // Remove all but one:
    diets = await db.Diet.findAll({
      where: {
        name: 'vegan',
      },
    });
    const dietsRemoved = await user.updateDiets(diets);
    expect(dietsRemoved).to.equal('success');
    userDiets = await user.getDiets(); // array of diet objects
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
  // it('user.updateDiets takes list of diet ids and adds/deletes userDiets records to reflect list', async () => {
  //   // any db data created must be destroyed at end of test
  //   const user = await db.User.create({
  //     email: 'diet@test.com',
  //     firstName: 'elena',
  //     lastName: 'roby',
  //   });
  //   const diets = await db.Diet.findAll({
  //     where: {
  //       name: 'vegan',
  //     },
  //   });
  //   // const dietsUpdated = await user.updateDiets(diets);
  //   // expect(dietsUpdated).to.equal('success');
  //   const dietsUpdated = await user.updateDiets(diets);
  //   expect(dietsUpdated).to.equal('success');
  //   console.log('--------user diets---------');
  //   const userDiets = await user.getDiets();
  //   console.log(userDiets);
  //   expect(userDiets.length).equals(1);
  //   // any db data created must be destroyed at end of test
  //   // Delete user agreements
  //   const allUserDiets = await db.UserDiet.findAll({});
  //   const userDietsDeleted = await allUserDiets.forEach(async (ud) => {
  //     await ud.destroy();
  //   });
  //   // Delete user
  //   if (userDietsDeleted) {
  //     await user.destroy();
  //   }
  // });
});
