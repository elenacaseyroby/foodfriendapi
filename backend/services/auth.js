import jwt from 'jsonwebtoken';
import { db } from '../models';

// Config environment variables so they are
// accessible through process.env

// Functions to create authentication tokens:
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

// Functions to check permissions of request:
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

// Functions relating to accessing an account:
export async function login(email, password) {
  // input email, password
  // output response

  const response = {
    status: 200,
    errorMessage: null,
    accessToken: null,
    userId: null,
  };

  // Get user.
  const user = await db.User.findOne({
    where: {
      email: email.toLowerCase().trim(),
    },
  });
  // If no user, return 404 not found.
  if (!user) {
    response.status = 404;
    response.errorMessage =
      'We could not find an account associated with the email you provided.';
    return response;
  }
  // Else validate password.
  const passwordValidated = await user.validatePassword(password);
  // If wrong password, return 401 access denied
  if (!passwordValidated) {
    response.status = 401;
    response.errorMessage = 'The password you have entered is incorrect.';
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
    errorMessage: null,
    accessToken: null,
    userId: null,
  };
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
    first_name: firstName.trim(),
    last_name: lastName.trim(),
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
  response.accessToken = generateJWT(user);
  response.userId = user.id;
  return response;
}
