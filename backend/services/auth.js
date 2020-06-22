import jwt from 'jsonwebtoken';

// Config environment variables so they are
// accessible through process.env

export function generateJWT(user) {
  const tokenData = { email: user.email, id: user.id };
  return jwt.sign({ user: tokenData }, process.env.JWT_SECRET);
}

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
  console.log(process.env.ADMIN_ACCESS_TOKEN);
  console.log(adminToken);
  if (!adminToken) return;
  if (adminToken !== process.env.ADMIN_ACCESS_TOKEN) return;
  return true;
}

// could use as middleware function in router.
export function requireLogin(req, res) {
  const tokenData = decodeToken(req);
  if (!tokenData) {
    return res
      .status('401')
      .json('You must be logged in to complete this request.');
  }
  return tokenData;
}

export function decodeToken(req) {
  console.log(req.headers);
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
