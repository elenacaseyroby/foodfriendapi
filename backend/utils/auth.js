import { decodeToken } from '../services/auth/tokens';

// FUNCTIONS TO CHECK PERMISSIONS OF A REQUEST

export function checkUserSignedIn(req) {
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
