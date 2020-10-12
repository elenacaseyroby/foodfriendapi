const { db } = require('../../models');
const {
  validateEmail,
  validatePassword,
} = require('../../utils/formValidation');
const { generateJWT } = require('./tokens');

// Config sendGrid.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendPasswordResetEmail(emailAddress) {
  // input email
  // output response
  const response = {
    status: 200,
    message: null,
  };

  // Validate Fields.
  let errorMessage = validateEmail(emailAddress);
  if (errorMessage) {
    response.status = 400;
    response.message = errorMessage;
    return response;
  }
  // Check if function is being run in a test.
  const isTest = process.env.NODE_ENV === 'test';

  // Check for user with email.
  const user = await db.User.findOne({
    where: {
      email: emailAddress.toLowerCase(),
    },
  });

  // If no user return error
  if (!user) {
    response.status = 404;
    response.message =
      'There is no account tied to the email you have entered. Please double check for typos.';
    return response;
  }

  // Else generate email to send password reset token.
  const token = await user.generatePasswordResetToken();
  // Send email with link to endpoint in foodfriend that redirects to deep link to
  // UpdatePassword component in foodfriendmobile.
  const url = `${process.env.FOODFRIEND_URL}/passwordreset/${user.id}/${token}`;
  const link = `<a href="${url}">link</a>`;
  // Set email properties
  const toEmail = user.email;
  const fromEmail = process.env.PASSWORD_RESET_FROM_EMAIL;
  const subject = 'Password reset request';
  const body = `<p>Hi ${user.firstName}, <br><br>
    From your smartphone or tablet, you can click on this ${link} to reset your FoodFriend password. <br>
    If you did not request this, please ignore this email and your password will remain unchanged.`;
  const mailOptions = {
    to: toEmail,
    from: fromEmail,
    subject: subject,
    text: `Hi ${user.firstName},
      From your smartphone or tablet, please visit this url: ${url} to reset your FoodFriend password.
      If you did not request this, please ignore this email and your password will remain unchanged.`,
    html: body,
  };
  // Send email if not a test
  if (!isTest) {
    try {
      sgMail.send(mailOptions, (error, result) => {});
    } catch (error) {
      response.status = 500;
      response.message = `Failed to send email. error:${error.message}`;
      return response;
    }
  }
  // Save email in emails table.
  let emailRecord;
  try {
    emailRecord = await db.Email.create({
      toEmail: toEmail,
      fromEmail: fromEmail,
      subject: subject,
      body: body,
    });
  } catch (error) {
    response.status = 500;
    response.message = `Failed to store email in emails table. error:${error.message}`;
    return response;
  }
  // If email is sent and record is saved, return success.
  response.message = `A reset email has been sent to ${user.email}.`;
  return response;
}

async function resetPassword(userId, passwordResetToken, newPassword) {
  // input userId, passwordResetToken, newPassword
  // output response
  const response = {
    status: 200,
    message: null,
    accessToken: null,
    userId: null,
  };
  // Validate fields.
  let errorMessage = userId
    ? null
    : 'Password reset not valid.  Please request another password reset email and try again.';
  errorMessage = passwordResetToken
    ? null
    : 'Password reset not valid.  Please request another password reset email and try again.';
  errorMessage = errorMessage || validatePassword(newPassword);
  if (errorMessage) {
    response.status = 400;
    response.message = errorMessage;
    return response;
  }
  // Get user with id
  const user = await db.User.findOne({
    where: {
      id: userId,
    },
  });
  // If no user return error.  This should never happen, so if it does,
  // there's a problem with how we are passing the user id through the password reset email.
  if (!user) {
    response.status = 404;
    response.message =
      'Could not update password. Please reach out to customer support using the email associated with your account to finalize the reset.';
    return response;
  }
  // Check for valid password reset token.
  const tokenIsValid = await user.validatePasswordResetToken(
    passwordResetToken
  );
  if (!tokenIsValid) {
    response.status = 401;
    response.message =
      'Could not complete your password reset request.  Please submit a new password reset request and try again.';
    return response;
  }
  // Update password.
  try {
    const passwordUpdated = await user.setPassword(newPassword);
    // return access token and user id
    if (passwordUpdated) {
      const token = generateJWT(user);
      response.userId = user.id;
      response.accessToken = token;
      response.message = 'Successfully updated password.';
      return response;
    }
    response.status = 500;
    response.message = `Failed to update password. ${error}`;
    return response;
  } catch (error) {
    response.status = 500;
    response.message = `Failed to update password. ${error}`;
    return response;
  }
}

module.exports = { sendPasswordResetEmail, resetPassword };
