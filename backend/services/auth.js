import jwt from 'jsonwebtoken';
import { db } from '../models';
import {
  validateEmail,
  validatePassword,
  validateName,
} from '../utils/formValidation';

// Config sendGrid.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// FUNCTIONS TO CREATE ACCESS TOKENS

export function generateJWT(user) {
  const tokenData = { email: user.email, id: user.id };
  return jwt.sign({ user: tokenData }, process.env.JWT_SECRET);
}

export function decodeToken(req) {
  const token = req.headers.authorization || req.headers['authorization'];

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// FUNCTIONS TO CHECK PERMISSIONS OF A REQUEST

export function checkUserIsLoggedIn(req) {
  // Must pass valid jwt token in headers as "authorization"
  // to be considered logged in.
  // Token should have been created from from user email & id
  // after password was validated.

  const tokenData = decodeToken(req);
  if (!tokenData) return false;
  return true;
}

export function checkIfAdmin(req) {
  const adminToken =
    req.headers.adminauthorization || req.headers['adminauthorization'];
  if (!adminToken) return;
  if (adminToken !== process.env.ADMIN_ACCESS_TOKEN) return;
  return true;
}

// FUNCTIONS TO ACCESS AN ACCOUNT

export async function login(email, password) {
  // input email, password
  // output response

  const response = {
    status: 200,
    message: null,
    accessToken: null,
    userId: null,
  };
  // Validate fields.
  let errorMessage = validateEmail(email);
  errorMessage = errorMessage || validatePassword(password);
  if (errorMessage) {
    response.status = 400;
    response.message = errorMessage;
    return response;
  }

  // Get user.
  const user = await db.User.findOne({
    where: {
      email: email.toLowerCase().trim(),
    },
  });
  // If no user, return 404 not found.
  if (!user) {
    response.status = 404;
    response.message =
      'We could not find an account associated with the email you provided.';
    return response;
  }
  // Else validate password.
  const passwordValidated = await user.validatePassword(password);
  // If wrong password, return 401 access denied
  if (!passwordValidated) {
    response.status = 401;
    response.message = 'The password you have entered is incorrect.';
    return response;
  }
  const accessToken = generateJWT(user);
  response.accessToken = accessToken;
  response.userId = user.id;
  return response;
}

export async function signUp(firstName, lastName, email, password) {
  // input email, password, first name, laste name
  // output response

  const response = {
    status: 200,
    message: null,
    accessToken: null,
    userId: null,
  };
  // Validate Fields.
  let errorMessage = validateEmail(email);
  errorMessage = errorMessage || validatePassword(password);
  errorMessage = errorMessage || validateName(firstName);
  errorMessage = errorMessage || validateName(lastName);
  if (errorMessage) {
    response.status = 400;
    response.message = errorMessage;
    return response;
  }
  // Check for user with email.
  const existingUser = await db.User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });
  if (existingUser) {
    (response.status = 401),
      (response.message =
        'There is already an account under the email that you entered.');
    return response;
  }
  // If not, create new user.
  const user = await db.User.create({
    email: email.toLowerCase().trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
  });
  if (!user) {
    response.status = 500;
    response.message = "Server error: couldn't create user.";
    return response;
  }
  const passwordSet = await user.setPassword(password);
  if (!passwordSet) {
    response.status = 500;
    response.message = "Server error: couldn't save password.";
    return response;
  }
  // Agree to Privacy Policy and Terms and Conditions.
  const latestTerms = await db.TermsAndConditions.findOne({
    order: [['datePublished', 'DESC']],
  });
  const agreedTerms = await user.agreeToTerms(latestTerms);
  const latestPolicy = await db.PrivacyPolicy.findOne({
    order: [['datePublished', 'DESC']],
  });
  const agreedPolicy = await user.agreeToPrivacyPolicy(latestPolicy);
  if (!(agreedTerms && agreedPolicy)) {
    response.status = 500;
    response.message = "Server error: couldn't agree to terms.";
    return response;
  }
  response.accessToken = generateJWT(user);
  response.userId = user.id;
  return response;
}

export async function sendPasswordResetEmail(emailAddress) {
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
  try {
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
      sgMail.send(mailOptions, (error, result) => {
        if (error) {
          response.status = 500;
          response.message = error.message;
          return response;
        }
      });
    }
    // Save email in emails table.
    const emailRecord = await db.Email.create({
      toEmail: toEmail,
      fromEmail: fromEmail,
      subject: subject,
      body: body,
    });
    // If email is sent and record is saved, return success.
    if (emailRecord) {
      response.message = `A reset email has been sent to ${user.email}.`;
      return response;
    }
    console.log('Info to help debug:');
    console.log(`emailRecord: ${emailRecord}`);
    console.log(`isTest: ${isTest}`);
    console.log(`sentEmail: ${sentEmail}`);
    response.status = 500;
    response.message = 'Email failed to send';
    return response;
  } catch (error) {
    response.status = 500;
    response.message = error.message;
    return response;
  }
}

export async function resetPassword(userId, passwordResetToken, newPassword) {
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
