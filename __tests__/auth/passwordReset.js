const {
  sendPasswordResetEmail,
  resetPassword,
} = require('../../services/auth/passwordReset');
const chai = require('chai');
const { db } = require('../../models');
const { expect } = chai;
require('dotenv').config();

describe('password reset tests:', async () => {
  before(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete any users already in test db.
    const allUsers = await db.User.findAll({});
    allUsers.forEach((user) => {
      user.destroy();
    });
    // Delete emails
    const allEmails = await db.Email.findAll({});
    allEmails.forEach(async (email) => {
      await email.destroy();
    });
  });
  after(async function () {
    // runs before all tests in this file regardless where this line is defined.

    // Delete users.
    const allUsers = await db.User.findAll({});
    allUsers.forEach((user) => {
      user.destroy();
    });
    // Delete emails
    const allEmails = await db.Email.findAll({});
    allEmails.forEach(async (email) => {
      await email.destroy();
    });
  });
  it('send password reset email', async () => {
    // delete all emails
    const allEmails = await db.Email.findAll({});
    allEmails.forEach(async (email) => {
      await email.destroy();
    });
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
      },
    });
    expect(email).to.exist;
    // any db data created must be destroyed at end of test
    await user.destroy();
    await email.destroy();
  });
  it('reset password successfully using userId and passwordResetToken (like would be sent in email)', async () => {
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
  it("if email not attached to user, don't send password reset email and return error.", async () => {
    // delete all emails
    const allEmails = await db.Email.findAll({});
    allEmails.forEach(async (email) => {
      await email.destroy();
    });
    const emailAddress = 'does@not.exist';
    // Request password reset email.
    const response = await sendPasswordResetEmail(emailAddress);
    // Expect request to fail because user not found.
    expect(response.status).to.equal(404);
    // Expect no email record in the db.
    const email = await db.Email.findOne({
      where: {
        toEmail: emailAddress,
      },
    });
    expect(email).to.not.exist;
  });
});
