import chai from 'chai';
import { db } from '../../models';

require('dotenv').config();
const Sequelize = require('sequelize');
const { expect } = chai;

describe('auth', async () => {
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
});
