import express, { Router } from 'express';
import dotenv from 'dotenv';
import { db } from './models';
import multer from 'multer';
import { generateJWT, checkUserIsLoggedIn } from './services/auth';
import { uploadNutrients } from './csv_upload_scripts/nutrients';
import { uploadNutrientBenefits } from './csv_upload_scripts/nutrient_benefits';
import { uploadNutrientFoods } from './csv_upload_scripts/nutrient_foods';
import { uploadNutrientRecipes } from './csv_upload_scripts/nutrient_recipes';
import { uploadPathNutrients } from './csv_upload_scripts/path_nutrients';

// Config environment variables so they are
// accessible through process.env
dotenv.config();

// Start app.
const app = express();
const port = process.env.PORT || process.env.PORT;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

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
      email: req.body.email,
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

// DATA
app.get('/nutrients', async (req, res) => {
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

// CSV UPLOADS
// TODO: add password protection on these pages.
const upload = multer({ dest: 'tmp/csv/' });

app.post('/upload-csv/nutrients', upload.single('uploadfile'), (req, res) => {
  uploadNutrients(req.file);
  res.send('request successful!');
});

app.post(
  '/upload-csv/nutrient_benefits',
  upload.single('uploadfile'),
  (req, res) => {
    uploadNutrientBenefits(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_foods',
  upload.single('uploadfile'),
  (req, res) => {
    uploadNutrientFoods(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/nutrient_recipes',
  upload.single('uploadfile'),
  (req, res) => {
    uploadNutrientRecipes(req.file);
    res.send('request successful!');
  }
);

app.post(
  '/upload-csv/path_nutrients',
  upload.single('uploadfile'),
  (req, res) => {
    uploadPathNutrients(req.file);
    res.send('request successful!');
  }
);

// Start server & listen for api requests.
app.listen(port, () => console.log(`listening on port ${port}`));
