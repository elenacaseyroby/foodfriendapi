const { db } = require('../../models');
const {
  validateEmail,
  validatePassword,
  validateName,
} = require('../../utils/formValidation');
const { generateJWT } = require('./tokens');

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
