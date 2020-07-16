import chai from 'chai';
import { db } from '../../models';

require('dotenv').config();
const Sequelize = require('sequelize');
const { expect } = chai;

describe('user model tests:', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
  });
  after(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
  });
  it('user.setPassword returns "success" on save.', async () => {
    const password = 'testtest';
    const email = 'test@test.com';
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: email,
      firstName: 'elena',
      lastName: 'roby',
    });
    const passwordSet = await user.setPassword(password);
    expect(passwordSet).to.equal('success');
    // any db data created must be destroyed at end of test
    user.destroy();
  });
  it('user.update updates user if properties have changed', async () => {
    // any db data created must be destroyed at end of test
    const email = 'test@test.com';
    let user = await db.User.create({
      email: email,
      firstName: 'elena',
      lastName: 'roby',
    });
    user = await db.User.findOne({
      email: email,
    });
    const updatedAt = user.updatedAt;
    const timeOut = await setTimeout(() => {
      return 'done';
    }, 10000);
    if (timeOut === 'done') {
      const updatedUser = await user.update({ firstName: 'Casey' });
      expect(updatedAt).is.not.equal(updatedUser.updatedAt);
    }
    // any db data created must be destroyed at end of test
    user.destroy();
  });
  it('user.update only updates input properties', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'test@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const updatedUser = await user.update({ firstName: 'Casey' });
    expect(user.lastName).is.equal(updatedUser.lastName);
    // any db data created must be destroyed at end of test
    user.destroy();
  });
  it('user.update does not update user if properties have not changed', async () => {
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: 'test@test.com',
      firstName: 'elena',
      lastName: 'roby',
    });
    const updatedAt = user.updatedAt;
    const timeOut = await setTimeout(() => {
      return 'done';
    }, 10000);
    if (timeOut === 'done') {
      const updatedUser = await user.update({ firstName: 'elena' });
      expect(updatedAt).is.not.equal(updatedUser.updatedAt);
    }
    // any db data created must be destroyed at end of test
    user.destroy();
  });
});
