import express from 'express';
import { db } from './models';
import multer from 'multer';
import { checkUserSignedIn, checkIfAdmin } from './utils/auth';
import { convertStringToDate } from './utils/common';
import { signUp } from './services/auth/signUp';
import { signIn } from './services/auth/signIn';
import {
  resetPassword,
  sendPasswordResetEmail,
} from './services/auth/passwordReset';
import {
  getDefaultPaths,
  getMenstruationPaths,
  getVeganPaths,
  generateActivePath,
  updatePathNutrients,
} from './services/models/paths';
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
        {
          model: db.Benefit,
          as: 'benefits',
          attributes: ['name'],
          through: { attributes: [] },
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

app.get('/paths/:userId', async (req, res) => {
  // Input: userId as a param and authorization (token) in the body.
  // Output: paths based on user (menstruates & isVegan) including custom path.
  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });
  const userId = await checkUserSignedIn(req);
  if (!userId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  try {
    const admin = await db.User.findOne({
      where: {
        email: 'admin@foodfriend.io',
      },
    });
    const allPaths = await db.Path.findAll({
      where: {
        ownerId: admin.id,
      },
    });
    const user = await db.User.findOne({
      where: {
        id: req.params.userId,
      },
    });
    let userPathIds;
    if (user.isVegan) {
      userPathIds = getVeganPaths(allPaths);
    } else if (user.menstruates) {
      userPathIds = getMenstruationPaths(allPaths);
    } else {
      userPathIds = getDefaultPaths(allPaths);
    }
    const customPath = await db.Path.findOne({
      where: {
        ownerId: userId,
      },
    });
    if (customPath) {
      userPathIds = [...userPathIds, customPath.id];
    }
    const returnPaths = await db.Path.findAll({
      where: {
        id: userPathIds,
      },
      include: [
        {
          model: db.PathTheme,
          as: 'theme',
        },
        {
          model: db.Nutrient,
          attributes: ['id'],
          as: 'nutrients',
          through: { attributes: [] }, // Hide unwanted nested object from results
        },
      ],
    });
    return res.status(200).json(returnPaths);
  } catch (error) {
    console.log(`error from /paths/:userId endpoint: ${error}`);
    return res.status(500).json({
      message: 'Server error.  Could not query user specific Paths from db.',
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

app.put('/users/:userId', async (req, res) => {
  // Input: userId in params, authorization (token) and properties to update in the body.
  // Output: updated user object.
  // body should only include properties
  // that are to be updated. For example,
  // this will only update the user's email:

  const userId = req.params.userId;
  // if date, convert for Sequelize
  let properties = {};
  for (const property in req.body) {
    if (property === 'birthday') {
      properties[property] = convertStringToDate(req.body[property]);
      console.log('made it');
    } else {
      properties[property] = req.body[property];
    }
  }
  if (!userId) return res.status(401).json({ message: 'Must pass user id.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }

  const user = await db.User.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  try {
    const updatedUser = await user.update(properties);
    // Exclude salt, password and other sensitive data from
    // the user instance we return:
    const cleanedUser = await updatedUser.getApiVersion();

    // consider: it might be better practice to simply return id and then use
    // /get to get the updated object.. but we will see.
    // does this break the restful requirements if it both updates and gets?
    // but I also don't want too many db connections so we shall see if I care.
    return res.status(200).json(cleanedUser);
  } catch (error) {
    return res.status(500).json(`Could not update user: ${error}`);
  }
});
app.get('/users/:userId/activepath', async (req, res) => {
  // Input: userId as a param and authorization (token) in the body.
  // Output: user's active path object.
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
  const activePath = await db.Path.findOne({
    where: {
      id: user.activePathId,
    },
  });
  return res.status(200).json(activePath);
});
app.get('/users/:userId/custompath', async (req, res) => {
  // Input: userId as a param and authorization (token) in the body.
  // Output: user's custom path object or 404.
  const userId = req.params.userId;
  if (!userId) return res.status(401).json({ message: 'Must pass user id.' });

  // could move this logic into a middleware function in router:
  // User can only get data of user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  try {
    const customPath = await db.Path.findOne({
      where: {
        ownerId: userId,
      },
    });
    if (!customPath)
      return res.status(404).json({ message: 'Custom path not found.' });
  } catch (error) {
    return res.status(500).json({
      message: `Could not complete custom path request. Error: ${error}.`,
    });
  }
});
app.put('/users/:userId/custompath', async (req, res) => {
  // Input: userId as a param and authorization (token), pathName, nutrientIds in the body.
  // Output: user's active path object.
  // Ex “nutrientIds”: [ 1, 5, 7]
  const userId = req.params.userId;
  const pathName = req.body.pathName;
  const nutrientIds = req.body.nutrientIds;
  if (!userId) return res.status(401).json({ message: 'Must pass user id.' });

  // could move this logic into a middleware function in router:
  // User can only get data of user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  if (!nutrientIds || nutrientIds.length > 3) {
    return res.status(401).json({
      message:
        'Each path must have between 1 and 3 nutrients.  Please make sure there is at least 1 and no more than 3 ids passed as "nutrientIds" in the body of the request.',
    });
  }
  try {
    // Check for existing custom path
    let customPath = await db.Path.findOne({
      where: {
        ownerId: userId,
      },
    });
    // if exists update name
    if (customPath) {
      // if name hasn't changed do nothing.
      if (customPath.name === pathName) return;
      customPath = await db.Path.update(
        { name: pathName },
        {
          where: {
            id: customPath.id,
          },
        }
      );
    } else {
      // get custom theme
      const customTheme = await db.PathTheme.findOne({
        where: {
          name: 'desert',
        },
      });
      // if custom path does not exist, create one
      customPath = await db.Path.create({
        name: pathName,
        ownerId: userId,
        themeId: customTheme.id,
      });
    }
    //update nutrients
    const nutrientsUpdated = await updatePathNutrients(
      customPath.id,
      nutrientIds
    );
    if (nutrientsUpdated) {
      return res
        .status(200)
        .json({ message: 'Custom path successfully updated.' });
    } else {
      return res.status(500).json({
        message: 'Something went wrong! Custom path failed to update.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Could not update user's custom path. Error: ${error}`,
    });
  }
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
  console.log(`diet ids: ${req.body.dietIds}`);
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

// ENDPOINTS TO PERFORM SPECIFIC FUNCTIONS
app.get('/generateUserActivePath/', async (req, res) => {
  // Input: authorization (token) and menstruates, isVegan, pathName in query string.
  // Output: path based on menstruates, isVegan and pathName.
  try {
    const activePath = await generateActivePath(
      req.query.menstruates,
      req.query.isVegan,
      req.query.pathName
    );
    return res.status(200).json(activePath);
  } catch (error) {
    return res.status(500).json(`Failed to generate active path: ${error}`);
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
