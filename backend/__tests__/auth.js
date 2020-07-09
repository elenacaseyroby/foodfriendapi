import {
  checkUserIsLoggedIn,
  signUp,
  sendPasswordResetEmail,
  resetPassword,
} from '../services/auth';
import chai from 'chai';
import { db } from '../models';

require('dotenv').config();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { expect } = chai;

describe('auth', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Create terms & privacy policy.
    const terms = await db.TermsAndConditions.create({
      text: 'some junk',
    });
    const policy = await db.PrivacyPolicy.create({
      text: 'some privacy junk',
    });
    // Delete any users already in test db.
    const allUsers = await db.User.findAll({});
    allUsers.forEach((user) => {
      user.destroy();
    });
    // Delete emails
    const allEmails = await db.Email.findAll({});
    allEmails.forEach((email) => {
      email.destroy();
    });
    // Delete agreements
    const allPolicyAgreements = await db.UserPrivacyPolicies.findAll({});
    allPolicyAgreements.forEach(async (p) => {
      await p.destroy();
    });
    const allTermsAgreements = await db.UserTermsAndConditions.findAll({});
    allTermsAgreements.forEach(async (t) => {
      await t.destroy();
    });
    return terms && policy;
  });
  after(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete terms & privacy policy.
    const terms = await db.TermsAndConditions.findOne({
      where: {
        text: 'some junk',
      },
    });
    const policy = await db.PrivacyPolicy.findOne({
      where: {
        text: 'some privacy junk',
      },
    });
    terms.destroy();
    policy.destroy();
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach((user) => {
      user.destroy();
    });
    // Delete emails
    const allEmails = await db.Email.findAll({});
    allEmails.forEach((email) => {
      email.destroy();
    });
    // Delete agreements
    const allPolicyAgreements = await db.UserPrivacyPolicies.findAll({});
    allPolicyAgreements.forEach((p) => {
      p.destroy();
    });
    const allTermsAgreements = await db.UserTermsAndConditions.findAll({});
    allTermsAgreements.forEach((t) => {
      t.destroy();
    });
    const allPolicies = await db.PrivacyPolicy.findAll({});
    allPolicies.forEach((p) => {
      p.destroy();
    });
    const allTerms = await db.TermsAndConditions.findAll({});
    allTerms.forEach((t) => {
      t.destroy();
    });
    return 'success';
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
  it('signUp function returns error when first name is empty string', async () => {
    const firstName = '';
    const lastName = 'Cam';
    const email = 'Dylan@live.com';
    const password = '12345678';
    const response = await signUp(firstName, lastName, email, password);
    expect(response.status).to.equal(400);
    expect(response.message).to.equal('Please provide a name.');
  });
  it('signUp function agrees user to terms and privacy policy', async () => {
    const firstName = 'Joe';
    const lastName = 'Roby';
    const email = 'Joe@robes.com';
    const password = '12345678';
    const response = await signUp(firstName, lastName, email, password);
    expect(response.status).to.equal(200);
    // Check that terms are agreed.
    const user = await db.User.findOne({
      where: {
        email: email,
      },
    });
    const latestTerms = await db.TermsAndConditions.findOne({
      order: [['datePublished', 'DESC']],
    });
    const userAgreedToTerms = await user.hasAgreedToTerms(latestTerms);
    const latestPolicy = await db.PrivacyPolicy.findOne({
      order: [['datePublished', 'DESC']],
    });
    const userAgreedToPrivacy = await user.hasAgreedToPrivacyPolicy(
      latestPolicy
    );
    expect(userAgreedToTerms && userAgreedToPrivacy).to.be.true;
    user.destroy();
  });
  it('send password reset email', async () => {
    const momentsAgo = Date();
    const emailAddress = 'elena@roby.com';
    const user = await db.User.create({
      email: emailAddress,
      firstName: 'elena',
      lastName: 'roby',
    });
    // Send email
    const response = await sendPasswordResetEmail(emailAddress);
    // Expect email status is success.
    expect(response.status).to.equal(200);
    // Expect email record in the db.
    const email = await db.Email.findOne({
      where: {
        toEmail: emailAddress,
        timeSent: {
          [Op.gte]: momentsAgo,
        },
      },
    });
    expect(email).to.exist;
    // any db data created must be destroyed at end of test
    user.destroy();
    email.destroy();
  });
  it('reset password successfully', async () => {
    // Create test data that would be included in the meta data of the redirect to
    // the UpdatePassword component in foodfriendmobile.
    const emailAddress = 'elena@roby.com';
    const user = await db.User.create({
      email: emailAddress,
      firstName: 'elena',
      lastName: 'roby',
    });
    // Set initial password.
    const passwordSet = await user.setPassword('11111111');
    expect(passwordSet).to.equal('success');
    const passwordResetToken = await user.generatePasswordResetToken();
    // Reset password.
    const newPassword = '88888888';
    const response = await resetPassword(
      user.id,
      passwordResetToken,
      newPassword
    );
    // Expect email status is success.
    expect(response.status).to.equal(200);
    // Get updated instance of user
    const updatedUser = await db.User.findOne({ where: { id: user.id } });
    const passwordUpdated = await updatedUser.validatePassword(newPassword);
    expect(passwordUpdated).to.be.true;
    // any db data created must be destroyed at end of test
    updatedUser.destroy();
  });
  it("don't send password reset email and return error if email not attached to user.", async () => {
    const momentsAgo = Date();
    const emailAddress = 'does@not.exist';
    // Request password reset email.
    const response = await sendPasswordResetEmail(emailAddress);
    // Expect request to fail because user not found.
    expect(response.status).to.equal(404);
    // Expect no email record in the db.
    const email = await db.Email.findOne({
      where: {
        toEmail: emailAddress,
        timeSent: {
          [Op.gte]: momentsAgo,
        },
      },
    });
    expect(email).to.not.exist;
  });
  // it('User cannot log in with incorrect password.', () => {});
  // it('User can login and use access token to access password-protected endpoints', () => {});
  // it('User that successfully logs in can load user data.', () => {});
});
