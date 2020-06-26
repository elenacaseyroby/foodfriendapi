import express, { Router } from 'express';
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

const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API ENDPOINTS BELOW

// AUTHENTICATION
app.post('/login', async (req, res) => {
  console.log(req.body);
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
    email: user.email,
    first_name: user.first_name,
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
  // Check for user with email.
  const existingUser = db.User.findAll({
    where: {
      email: req.body.email,
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
    email: user.email,
    first_name: user.first_name,
    access_token: token,
  });
});

// DATA
app.get('/users/:user_id', async (req, res) => {
  // could move this logic into a middleware function in router.
  console.log(`token:${req.headers.authorization}`);
  console.log(`user id:${req.params.user_id}`);
  const loggedIn = await checkUserIsLoggedIn(req, res);
  if (!loggedIn) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  if (!req.params.user_id)
    return res.status(401).json({ message: 'Must pass user_id.' });
  db.User.findOne({
    where: {
      id: req.params.user_id,
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
    where: { email: req.body.email },
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

app.post('/upload-csv/nutrients', upload.single('uploadfile'), (req, res) => {
  // Must pass headers.adminauthorization with request.
  const isAdmin = await checkIfAdmin(req);
  if (!isAdmin) {
    console.log('not admin');
    return res.status(401).json({
      message: 'You do not have necessary permissions to perform this action.',
    });
  }
  uploadNutrients(req.file);
  res.send('request successful!');
});

app.post(
  '/upload-csv/nutrient_benefits',
  upload.single('uploadfile'),
  (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message: 'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrientBenefits(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_foods',
  upload.single('uploadfile'),
  (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message: 'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrientFoods(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_recipes',
  upload.single('uploadfile'),
  (req, res) => {
    // Must pass headers.adminauthorization with request.
  const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message: 'You do not have necessary permissions to perform this action.',
      });
    }
    uploadNutrientRecipes(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/path_nutrients',
  upload.single('uploadfile'),
  (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
      console.log('not admin');
      return res.status(401).json({
        message: 'You do not have necessary permissions to perform this action.',
      });
    }
    uploadPathNutrients(req.file);
    res.send('request successful!');
  }
);

// Start server & listen for api requests.
app.listen(port, () => console.log(`listening on port ${port}`));
