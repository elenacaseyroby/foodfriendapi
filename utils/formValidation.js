function validateEmail(email) {
  // input string
  // output error message or undefined
  if (!email || '') {
    return 'Please enter a valid email address.';
  }
  if (email.length < 5) {
    return 'Please enter a valid email address.';
  }
  if (email.length > 70) {
    return 'Email too long.  Please enter a shorter, valid email address.';
  }
  if (!email.includes('@')) {
    return 'Please enter a valid email address.';
  }
  return;
}
function validatePassword(password) {
  // input string
  // output error message or undefined
  if (!password || '') {
    return 'Please enter a password.';
  }
  if (password.length > 70) {
    return 'Password too long. Please shorten password and submit again.';
  }
  if (password.length < 8) {
    return 'Password must contain at least 8 characters.';
  }
  return;
}
function validateName(name) {
  // input string
  // output error message or undefined
  if (!name || name === '') {
    return 'Please provide a name.';
  }
  if (name.length > 30) {
    return 'Name must be under 30 characters.';
  }
  return;
}

module.exports = { validateEmail, validatePassword, validateName };
