const { checkUserSignedIn } = require('../../utils/auth');
const { signIn } = require('../../services/auth/signIn');
const { expect } = require('chai');
const { db } = require('../../models');
require('dotenv').config();

describe('sign in tests:', async () => {
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
  it('signin function returns response with valid accessToken', async () => {
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
    const response = await signIn(email, password);
    expect(response.status).to.equal(200);
    const req = {
      headers: {
        authorization: response.accessToken,
      },
    };
    const userIsLoggedIn = checkUserSignedIn(req);
    expect(userIsLoggedIn).to.be.equal(user.id);
    // any db data created must be destroyed at end of test
    user.destroy();
  });
  // it('User cannot log in with incorrect password.', () => {});
  // it('User can login and use access token to access password-protected endpoints', () => {});
  // it('User that successfully logs in can load user data.', () => {});
});
