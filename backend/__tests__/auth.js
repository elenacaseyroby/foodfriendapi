import jwt from 'jsonwebtoken';
import {
  generateJWT,
  checkUserIsLoggedIn,
  login,
  signUp,
} from '../services/auth';
import chai from 'chai';
import { db } from '../models';

require('dotenv').config();
const should = chai.should();
const { expect } = chai;

describe('auth', async () => {
  it('JWT token that is created on login is verified.', () => {
    const user = {
      id: 1,
      email: 't@t.t',
      password: 'lkjadaf',
      salt: 'lkjasfdl',
    };
    const token = generateJWT(user);
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    should.exist(tokenData);
  });
  it('user.setPassword returns "success" on save.', async () => {
    const password = 'testtest';
    const email = 'test@test.com';
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: email,
      first_name: 'elena',
      last_name: 'roby',
    });
    const passwordSet = await user.setPassword(password);
    expect(passwordSet).to.equal('success');
    // any db data created must be destroyed at end of test
    user.destroy();
  });
  it('login function returns response with valid accessToken', async () => {
    const password = 'testtest';
    const email = 'test@test.com';
    // any db data created must be destroyed at end of test
    const user = await db.User.create({
      email: email,
      first_name: 'elena',
      last_name: 'roby',
    });
    const passwordSet = await user.setPassword(password);
    expect(passwordSet).to.equal('success');
    const response = await login(email, password);
    expect(response.status).to.equal(200);
    const req = {
      headers: {
        authorization: response.accessToken,
      },
    };
    const userIsLoggedIn = checkUserIsLoggedIn(req);
    expect(userIsLoggedIn).to.be.true;
    // any db data created must be destroyed at end of test
    user.destroy();
  });
  it('signUp function returns response with valid accessToken', async () => {
    const firstName = 'Dyl';
    const lastName = 'Cam';
    const email = 'Dylan@live.com';
    const password = '12345678';
    const response = await signUp(firstName, lastName, email, password);
    expect(response.status).to.equal(200);
    const req = {
      headers: {
        authorization: response.accessToken,
      },
    };
    const userIsLoggedIn = checkUserIsLoggedIn(req);
    expect(userIsLoggedIn).to.be.true;
    // any db data created must be destroyed at end of test
    const user = await db.User.findOne({
      where: {
        email: email,
      },
    });
    user.destroy();
  });
  // it('User cannot log in with incorrect password.', () => {});
  // it('User can login and use access token to access password-protected endpoints', () => {});
  // it('User that successfully logs in can load user data.', () => {});
});
