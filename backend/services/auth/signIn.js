const { generateJWT } = require('./tokens');
const { db } = require('../../models');
const {
  validateEmail,
  validatePassword,
} = require('../../utils/formValidation');

export async function signIn(email, password) {
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
