import express from 'express';
import { db } from './models';
import multer from 'multer';
import { checkUserSignedIn, checkIfAdmin } from './utils/auth';
import { signUp } from './services/auth/signUp';
import { signIn } from './services/auth/signIn';
import {
  resetPassword,
  sendPasswordResetEmail,
} from './services/auth/passwordReset';
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

// Config bodyparser for handling api request data.
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// 400 incorrect info supplied
// 401 unauthorized
// 404 not found

// API ENDPOINTS:

// MOBILE APP DATA
app.get('/nutrients', async (req, res) => {
  // could move this logic into a middleware function in router.
  const loggedInUserId = await checkUserSignedIn(req);
  if (!loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  try {
    const nutrients = await db.Nutrient.findAll({
      include: [
        {
          model: db.Food,
          through: {},
          as: 'foods',
        },
      ],
    });
    return res.status(200).json(nutrients);
  } catch (error) {
    console.log(`error from /nutrients endpoint: ${error}`);
    return res.status(500).json({
      message: 'Server error.  Could not query Nutrients from db.',
    });
  }
});

app.get('/privacypolicy', async (req, res) => {
  try {
    const pp = await db.PrivacyPolicy.findOne({
      order: [['datePublished', 'DESC']],
    });
    return res.status(200).json(pp);
  } catch (error) {
    console.log(`error from /privacypolicy endpoint: ${error}`);
    return res.status(500).json({
      message: 'Server error.  Could not query PrivacyPolicy from db.',
    });
  }
});

app.get('/termsandconditions', async (req, res) => {
  try {
    const terms = await db.TermsAndConditions.findOne({
      order: [['datePublished', 'DESC']],
    });
    return res.status(200).json(terms);
  } catch (error) {
    console.log(`error from /privacypolicy endpoint: ${error}`);
    return res.status(500).json({
      message: 'Server error.  Could not query PrivacyPolicy from db.',
    });
  }
});

app.get('/users/:userId', async (req, res) => {
  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });
  // could move this logic into a middleware function in router.
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  db.User.findOne({
    where: {
      id: req.params.userId,
    },
  }).then((user) => {
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      isVegan: user.isVegan,
      menstruates: user.menstruates,
      activePathId: user.activePathId,
    });
  });
});

app.post('/users', async (req, res) => {
  // could move this logic into a middleware function in router.
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId) {
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
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      isVegan: user.isVegan,
      menstruates: user.menstruates,
      activePathId: user.activePathId,
    });
  });
});

// AUTHENTICATION
app.post('/signin', async (req, res) => {
  const response = await signIn(req.body.email, req.body.password);
  return res.status(response.status).json({
    messsage: response.message,
    userId: response.userId,
    accessToken: response.accessToken,
  });
});

app.post('/signup', async (req, res) => {
  const response = await signUp(
    req.body.firstName,
    req.body.lastName,
    req.body.email,
    req.body.password
  );
  return res.status(response.status).json({
    message: response.message,
    userId: response.userId,
    accessToken: response.accessToken,
  });
});

app.post('/sendpasswordresetemail', async (req, res) => {
  const response = await sendPasswordResetEmail(req.body.email);
  return res.status(response.status).json({ message: response.message });
});

app.post('/resetpassword', async (req, res) => {
  const response = await resetPassword(
    req.body.userId,
    req.body.passwordResetToken,
    req.body.newPassword
  );
  return res.status(response.status).json({
    userId: response.userId,
    accessToken: response.accessToken,
    message: response.message,
  });
});

// ADMIN TOOLS
app.put('/users/changePassword', async (req, res) => {
  // Must pass headers.adminauthorization with request.
  const isAdmin = await checkIfAdmin(req);
  if (!isAdmin) {
    return res.status(401).json({
      message: 'You do not have necessary permissions to perform this action.',
    });
  }
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
  upload.single('nutrientsCSV'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
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
  '/upload-csv/nutrient-benefits',
  upload.single('nutrientBenefitsCSV'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
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
  '/upload-csv/nutrient-foods',
  upload.single('nutrientFoodsCSV'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
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
  '/upload-csv/nutrient-recipes',
  upload.single('nutrientRecipesCSV'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
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
  '/upload-csv/path-nutrients',
  upload.single('pathNutrientsCSV'),
  async (req, res) => {
    // Must pass headers.adminauthorization with request.
    const isAdmin = await checkIfAdmin(req);
    if (!isAdmin) {
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
