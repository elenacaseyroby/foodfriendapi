import jwt from 'jsonwebtoken';
import { generateJWT } from '../../services/auth';
import chai from 'chai';
require('dotenv').config();
const should = chai.should();

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
});
