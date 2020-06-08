import express, { Router } from 'express';
import dotenv from 'dotenv';
import { db } from './models';
import multer from 'multer';
import { uploadNutrients } from './csv_upload_scripts/nutrients';
import { uploadNutrientBenefits } from './csv_upload_scripts/nutrient_benefits';
import { uploadNutrientFoods } from './csv_upload_scripts/nutrient_foods';
import { uploadNutrientRecipes } from './csv_upload_scripts/nutrient_recipes';
import { uploadNutrientPaths } from './csv_upload_scripts/nutrient_paths';

// Config environment variables so they are
// accessible through process.env
dotenv.config();

// Start app.
const app = express();
const port = process.env.PORT || process.env.PORT;

// Make endpoints to upload csvs to update database.
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
  '/upload-csv/nutrient_paths',
  upload.single('uploadfile'),
  (req, res) => {
    uploadNutrientPaths(req.file);
    res.send('request successful!');
  }
);

// Define api endpoints.
app.get('/nutrients', (req, res) =>
  db.Nutrient.findAll({
    include: [
      {
        model: db.Food,
        through: {},
        as: 'foods',
      },
    ],
  }).then((result) => res.json(result))
);

// Start server & listen for api requests.
app.listen(port, () => console.log(`listening on port ${port}`));
