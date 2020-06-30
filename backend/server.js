import express from 'express';
import { db } from './models';
import multer from 'multer';
import {
  generateJWT,
  checkUserIsLoggedIn,
  checkIfAdmin,
} from './services/auth';
import { uploadNutrients } from './csv_upload_scripts/nutrients';
import { uploadNutrientBenefits } from './csv_upload_scripts/nutrient_benefits';
import { uploadNutrientFoods } from './csv_upload_scripts/nutrient_foods';
import { uploadNutrientRecipes } from './csv_upload_scripts/nutrient_recipes';
import { uploadPathNutrients } from './csv_upload_scripts/path_nutrients';

// Config environment variables so they are
// accessible through process.env
require('dotenv').config();
console.log(process.env.NODE_ENV);

// Start app.
const app = express();
const port = process.env.PORT || process.env.PORT;

// Config sendGrid.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Config bodyparser for handling api request data.
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// API ENDPOINTS BELOW

// AUTHENTICATION
app.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).json({
      message: 'You must enter your email and your password to login.',
    });
  }
  // Get user.
  const user = await db.User.findOne({
    where: {
      email: req.body.email.toLowerCase().trim(),
    },
  });
  if (!user) {
    return res.status(401).json({
      message:
        'We could not find an account associated with the email you provided.',
    });
  }
  console.log(user);
  const passwordValidated = user.validatePassword(req.body.password);
  if (!passwordValidated) {
    return res.status(401).json({
      message: 'The password you have entered is incorrect.',
    });
  }
  const token = generateJWT(user);
  return res.status(200).json({
    id: user.id,
    access_token: token,
  });
});

app.post('/signup', async (req, res) => {
  // Make sure form is filled out.
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.first_name ||
    !req.body.last_name
  ) {
    return res.status(401).json({
      message: 'You must fill out all of the fields to create your account.',
    });
  }
  if (req.body.password.length < 8) {
    return res.status(401).json({
      message: 'Your password must be 8 or more characters long.',
    });
  }
  // Check for user with email.
  const existingUser = await db.User.findAll({
    where: {
      email: req.body.email.toLowerCase(),
    },
  });
  if (existingUser.length > 0)
    return res.status(400).json({
      message: 'There is already an account under the email that you entered.',
    });
  // If not, create new user.
  const user = await db.User.create({
    email: req.body.email.toLowerCase().trim(),
    first_name: req.body.first_name.trim(),
    last_name: req.body.last_name.trim(),
  });
  user.setPassword(req.body.password);
  const token = generateJWT(user);
  return res.status(200).json({
    id: user.id,
    access_token: token,
  });
});

app.post('/sendPasswordResetEmail', async (req, res) => {
  // Make sure form is filled out.
  console.log(JSON.stringify(req.body));
  if (!req.body.email || (req.body.email && !req.body.email.includes('@'))) {
    return res.status(401).json({
      message:
        'You must enter a valid email to request a password reset email.',
    });
  }
  // Check for user with email.
  const user = await db.User.findOne({
    where: {
      email: req.body.email.toLowerCase(),
    },
  });
  // If no user return error
  if (!user)
    return res.status(400).json({
      message:
        'There is no account tied to the email you have entered. Please double check for typos.',
    });
  // Else generate email.
  // Generate and set password reset token
  const token = await user.generatePasswordResetToken();

  // ERROR HERE
  try {
    // Send email with link to redirect to deep link to app UpdatePassword component.
    const url = `${process.env.FOODFRIEND_URL}/passwordreset/${user.id}/${token}`;
    const link = `<a href="${url}">link</a>`;
    const mailOptions = {
      to: user.email,
      from: process.env.PASSWORD_RESET_FROM_EMAIL,
      subject: 'Password reset request',
      text: `Hi ${user.first_name},
      From your smartphone or iPad, please visit this url: ${url} to reset your FoodFriend password.
      If you did not request this, please ignore this email and your password will remain unchanged.`,
      html: `<p>Hi ${user.first_name}, <br><br> 
      Please click on this ${link} to reset your FoodFriend password. <br>
      If you did not request this, please ignore this email and your password will remain unchanged.`,
    };
    sgMail.send(mailOptions, (error, result) => {
      if (error) return res.status(500).json({ message: error.message });
      res.status(200).json({
        message: 'A reset email has been sent to ' + user.email + '.',
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post('/resetPassword', async (req, res) => {
  // Validate fields.
  if (!req.body.userId || !req.body.passwordResetToken || !req.body.newPassword)
    return res.status(401).json({
      message:
        'Could not complete your password reset request.  Please submit a new password reset request and try again.',
    });
  if (req.body.newPassword.length < 8) {
    return res.status(401).json({
      message: 'Your password must be 8 or more characters long.',
    });
  }
  // Check for user with email.
  const user = await db.User.findOne({
    where: {
      id: req.body.userId,
    },
  });
  // If no user return error
  if (!user)
    return res.status(400).json({
      message:
        'There is no account tied to the email you have entered. Please double check for typos.',
    });
  // Check for valid password reset token.
  const tokenIsValid = await user.validatePasswordResetToken(
    req.body.passwordResetToken
  );
  if (!tokenIsValid)
    return res.status(401).json({
      message:
        'Could not complete your password reset request.  Please submit a new password reset request and try again.',
    });
  // Update password.
  try {
    user.setPassword(req.body.newPassword);
    user.save();
    // return access token and user id
    const token = generateJWT(user);
    return res.status(200).json({
      id: user.id,
      accessToken: token,
      message: 'Successfully updated password.',
    });
  } catch (error) {
    return res.status(400).json({ message: 'failed to update password.' });
  }
});

// DATA
app.get('/users/:userId', async (req, res) => {
  // could move this logic into a middleware function in router.
  console.log(`token:${req.headers.authorization}`);
  console.log(`user id:${req.params.userId}`);
  const loggedIn = await checkUserIsLoggedIn(req, res);
  if (!loggedIn) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });
  db.User.findOne({
    where: {
      id: req.params.userId,
    },
  }).then((user) => {
    if (!user) return res.status(401).json({ message: 'User not found.' });
    return res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      birthday: user.birthday,
      is_vegan: user.is_vegan,
      mensruates: user.mensruates,
      active_path_id: user.active_path_id,
    });
  });
});

app.get('/nutrients', async (req, res) => {
  // could move this logic into a middleware function in router.
  const loggedIn = await checkUserIsLoggedIn(req, res);
  if (!loggedIn) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  db.Nutrient.findAll({
    include: [
      {
        model: db.Food,
        through: {},
        as: 'foods',
      },
    ],
  }).then((result) => res.json(result));
});

// ADMIN
app.put('/users/changePassword', async (req, res) => {
  // Must pass headers.adminauthorization with request.
  const isAdmin = await checkIfAdmin(req);
  if (!isAdmin) {
    console.log('not admin');
    return res.status(401).json({
      message: 'You do not have necessary permissions to perform this action.',
    });
  }
  console.log('is admin');
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ message: 'bad params: email or password not passed.' });
  }
  const user = await db.User.findOne({
    where: { email: req.body.email.toLowerCase() },
  });
  try {
    user.setPassword(req.body.password);
    user.save();
    return res.status(200).json({ message: 'password successfully updated.' });
  } catch (e) {
    return res.status(400).json({ message: 'failed to update password.' });
  }
});

// CSV UPLOADS
// TODO: add password protection on these pages.
const upload = multer({ dest: 'tmp/csv/' });

app.post(
  '/upload-csv/nutrients',
  upload.single('uploadfile'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message:
          'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrients(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_benefits',
  upload.single('uploadfile'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message:
          'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrientBenefits(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_foods',
  upload.single('uploadfile'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message:
          'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrientFoods(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_recipes',
  upload.single('uploadfile'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message:
          'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrientRecipes(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/path_nutrients',
  upload.single('uploadfile'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message:
          'You do not have necessary permissions to perform this action.',
      });
    }
    uploadPathNutrients(req.file);
    res.send('request successful!');
  }
);

// Start server & listen for api requests.
app.listen(port, () => console.log(`listening on port ${port}`));
