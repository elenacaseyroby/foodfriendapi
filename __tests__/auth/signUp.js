const { checkUserSignedIn } = require('../../utils/auth');
const { signUp } = require('../../services/auth/signUp');
const { expect } = require('chai');
const { db } = require('../../models');
require('dotenv').config();

describe('sign up tests:', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Create terms & privacy policy.
    const terms = await db.TermsAndConditions.create({
      text: 'some junk',
    });
    const policy = await db.PrivacyPolicy.create({
      text: 'some privacy junk',
    });
    // Delete user agreements
    const allPolicyAgreements = await db.UserPrivacyPolicies.findAll({});
    allPolicyAgreements.forEach(async (p) => {
      await p.destroy();
    });
    const allTermsAgreements = await db.UserTermsAndConditions.findAll({});
    allTermsAgreements.forEach(async (t) => {
      await t.destroy();
    });
    // Delete any users already in test db.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
    });
    return terms && policy;
  });
  after(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete user agreements
    const allPolicyAgreements = await db.UserPrivacyPolicies.findAll({});
    allPolicyAgreements.forEach(async (p) => {
      await p.destroy();
    });
    const allTermsAgreements = await db.UserTermsAndConditions.findAll({});
    allTermsAgreements.forEach(async (t) => {
      await t.destroy();
    });
    // Delete terms & privacy policy.
    const allPolicies = await db.PrivacyPolicy.findAll({});
    allPolicies.forEach(async (p) => {
      await p.destroy();
    });
    const allTerms = await db.TermsAndConditions.findAll({});
    allTerms.forEach(async (t) => {
      await t.destroy();
    });
    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach(async (user) => {
      await user.destroy();
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
    const userIsLoggedIn = checkUserSignedIn(req);
    const user = await db.User.findOne({
      where: {
        email: email,
      },
    });
    expect(userIsLoggedIn).to.be.equal(user.id);
    // any db data created must be destroyed at end of test
    // Delete user agreements
    const allPolicyAgreements = await db.UserPrivacyPolicies.findAll({});
    const policiesDeleted = await allPolicyAgreements.forEach(async (p) => {
      await p.destroy();
    });
    const allTermsAgreements = await db.UserTermsAndConditions.findAll({});
    const termsDeleted = await allTermsAgreements.forEach(async (t) => {
      await t.destroy();
    });
    // Delete user
    if (policiesDeleted && termsDeleted) {
      await user.destroy();
    }
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
    // any db data created must be destroyed at end of test
    // Delete user agreements
    const allPolicyAgreements = await db.UserPrivacyPolicies.findAll({});
    allPolicyAgreements.forEach(async (p) => {
      await p.destroy();
    });
    const allTermsAgreements = await db.UserTermsAndConditions.findAll({});
    allTermsAgreements.forEach(async (t) => {
      await t.destroy();
    });
    user.destroy();
  });
});
