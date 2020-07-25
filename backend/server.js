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

// FoodFriend API style guide:
// https://docs.google.com/document/d/1PEyAj9p4K4B_t7z1s74qUhJlAi_ZARgdmRbOBfTS0RE/edit?usp=sharing

// API ENDPOINTS:
app.get('/diets', async (req, res) => {
  try {
    const diets = await db.Diet.findAll({});
    return res.status(200).json(diets);
  } catch (error) {
    console.log(`error from /diets endpoint: ${error}`);
    return res.status(500).json({
      message: 'Server error.  Could not query Diets from db.',
    });
  }
});

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

app.get('/paths', async (req, res) => {
  try {
    const admin = await db.User.findOne({
      where: {
        email: 'admin@foodfriend.io',
      },
    });
    const paths = await db.Path.findAll({
      where: {
        ownerId: admin.id,
      },
    });
    return res.status(200).json(paths);
  } catch (error) {
    console.log(`error from /diets endpoint: ${error}`);
    return res.status(500).json({
      message: 'Server error.  Could not query Paths from db.',
    });
  }
});

app.get('/privacypolicy', async (req, res) => {
  // Gets most recently published by default.
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
  // Gets most recently published by default.
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
  // Input: userId as a param and authorization (token) in the body.
  // Output: user object.
  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

  // could move this logic into a middleware function in router:
  // User can only get data of user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }

  const user = await db.User.findOne({
    where: {
      id: req.params.userId,
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  // Exclude salt, password and other sensitive data from
  // the user instance we return:
  const cleanedUser = await user.getApiVersion();
  return res.status(200).json(cleanedUser);
});

app.put('/users', async (req, res) => {
  // Input: userId, authorization (token) and propertiesToUpdate (json object) in the body.
  // Output: updated user object.
  // propertiesToUpdate json object should only include properties
  // that are to be updated. For example,
  // this will only update the user's email:
  // propertiesToUpdate = {
  //   'email' : 'email@email.email'
  // }
  if (!req.body.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.body.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }

  const user = await db.User.findOne({
    where: {
      id: req.body.userId,
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const updatedUser = await user.update(req.body.propertiesToUpdate);
  // Exclude salt, password and other sensitive data from
  // the user instance we return:
  const cleanedUser = await updatedUser.getApiVersion();

  // consider: it might be better practice to simply return id and then use
  // /get to get the updated object.. but we will see.
  // does this break the restful requirements if it both updates and gets?
  // but I also don't want too many db connections so we shall see if I care.
  return res.status(200).json(cleanedUser);
});
app.get('/users/:userId/diets', async (req, res) => {
  // Gets all diets for a given user.
  // Input: userId in params, authorization (token) in body
  // Output: diets json object
  // diets = {
  //   vegan: {
  //     id: 1,
  //   },
  //   'gluten-free': {
  //     id: 2,
  //   },
  // };
  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  const user = await db.User.findOne({
    where: {
      id: req.params.userId,
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  try {
    const diets = await user.getDiets();
    return res.status(200).json(diets);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error: failed to retrieve user diets.' });
  }
});
app.put('/users/:userId/diets', async (req, res) => {
  // Updates all diets for a given user to match provided dietIds.
  // Input: userId in params, authorization (token) and dietIds (json objs) in the body.
  // Output: 200
  // Ex “dietIds”: [ 1, 5, 7]
  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });
  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  const user = await db.User.findOne({
    where: {
      id: req.params.userId,
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  try {
    const diets = await db.Diet.findAll({
      where: {
        id: req.body.dietIds,
      },
    });
    const dietsUpdated = await user.updateDiets(diets);
    if (dietsUpdated === 'success')
      return res.status(200).json({ message: 'Successfully added diets.' });
  } catch (error) {
    return res
      .status(404)
      .json({ message: 'Server error: failed to update diets.' });
  }
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
