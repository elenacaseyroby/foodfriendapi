import { decodeToken } from '../services/auth/tokens';

// FUNCTIONS TO CHECK PERMISSIONS OF A REQUEST

export function checkUserSignedIn(req) {
  // input: req data
  // output:
  // userId if logged in
  // undefined if logged out

  // Must pass valid jwt token in headers as "authorization"
  // to be considered logged in.
  // Token should have been created from from user email & id
  // after password was validated.

  const tokenData = decodeToken(req);
  if (!tokenData) return;
  const loggedInUserId = tokenData.user.id;
  return loggedInUserId;
}

export function checkIfAdmin(req) {
  // input: req data
  // output:
  // true if admin
  // false if not

  const adminToken =
    req.headers.adminauthorization || req.headers['adminauthorization'];
  if (!adminToken) return;
  if (adminToken !== process.env.ADMIN_ACCESS_TOKEN) return;
  return true;
}
