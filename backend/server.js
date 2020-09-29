import express from 'express';
import { db } from './models';
import { Op } from 'sequelize';
import multer from 'multer';
import { checkUserSignedIn, checkIfAdmin } from './utils/auth';
import {
  convertStringToDate,
  getTodaysDate,
  getRelativeDateTime,
} from './utils/common';
import { signUp } from './services/auth/signUp';
import { signIn } from './services/auth/signIn';
import {
  resetPassword,
  sendPasswordResetEmail,
} from './services/auth/passwordReset';
import {
  filterUserPaths,
  generateActivePath,
  updatePathNutrients,
  getPathHighPotencyFoods,
} from './services/models/paths';
import { uploadNutrients } from './csv_upload_scripts/nutrients';
import { uploadNutrientBenefits } from './csv_upload_scripts/nutrient_benefits';
import { uploadNutrientFoods } from './csv_upload_scripts/nutrient_foods';
import { uploadNutrientRecipes } from './csv_upload_scripts/nutrient_recipes';
import { uploadPathNutrients } from './csv_upload_scripts/path_nutrients';
import e from 'express';

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
          // order: [['NutrientFood.percentDvPerServing', 'DESC']],
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

// unused endpoint.
// app.get('/paths/', async (req, res) => {
//   // Input: userId as a query string and authorization (token) in the body.
//   // Output: filterd paths based on user (menstruates & isVegan).

//   // Use user properties to filter paths.
//   const userId = req.query.userId;
//   if (!userId) return res.status(401).json({ message: 'Must pass user id.' });
//   // could move this logic into a middleware function in router:
//   // User can only post data to user they are signed in as:
//   const loggedInUserId = checkUserSignedIn(req);
//   if (!loggedInUserId || parseInt(userId) !== loggedInUserId) {
//     return res.status(401).json({
//       message: 'You must be logged in to complete this request.',
//     });
//   }
//   try {
//     const user = await db.User.findOne({
//       where: {
//         id: userId,
//       },
//     });
//     // Filter paths based on user properties (isVegan and menstruates).
//     const returnPaths = await filterUserPaths(user.isVegan, user.menstruates);
//     return res.status(200).json(returnPaths);
//   } catch (error) {
//     console.log(`error from /paths/:userId endpoint: ${error}`);
//     return res.status(500).json({
//       message: 'Server error.  Could not query user specific Paths from db.',
//     });
//   }
// });

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

app.put('/recipes/:recipeId/reportlink', async (req, res) => {
  // Input: recipeId in params, authorization (token) and userId in the body.
  // Output: success/failure

  const recipeId = req.params.recipeId;
  const userId = req.body.userId;
  if (!userId) return res.status(401).json({ message: 'Must pass user id.' });

  // Could move this logic into a middleware function in router:
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

  const recipe = await db.Recipe.findOne({
    where: {
      id: recipeId,
    },
  });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
  try {
    const updatedRecipe = await recipe.update({
      reportedByUserId: userId,
      userReportIsVerified: null,
    });
    if (updatedRecipe) {
      return res
        .status(200)
        .json({ message: 'Recipe link successfully reported' });
    } else {
      return res
        .status(500)
        .json({ message: 'Recipe link failed to be reported' });
    }
  } catch (error) {
    console.log(`Recipe link failed to be reported: ${error}`);
    return res
      .status(500)
      .json({ message: `Recipe link failed to be reported: ${error}` });
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
  // NOTE: object includes paths and active path since those are dependent
  // on user properties isVegan and menstruates.
  // If they stop being dependent on user properties, they can be moved into their
  // own endpoints.
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
    include: {
      model: db.Path,
      as: 'activePath',
      include: [
        {
          model: db.PathTheme,
          as: 'theme',
        },
        {
          model: db.Nutrient,
          as: 'nutrients',
          attributes: ['id'],
          through: { attributes: [] }, // Hide unwanted nested object from results
        },
      ],
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  try {
    // track user activity:
    const today = getTodaysDate();
    user.update({ dateLastActive: today });
    // Exclude salt, password and other sensitive data from
    // the user instance we return:
    // exclude activePath property and replace it with the return version.
    const propertiesToHide = ['activePath'];
    const returnUser = await user.getApiVersion(propertiesToHide);

    // Add user's paths and active paths
    // which are dependent on user.isVegan and user.menstruates.
    returnUser.paths = await filterUserPaths(user.isVegan, user.menstruates);
    returnUser.customPath = await db.Path.findOne({
      where: {
        ownerId: user.id,
      },
      include: [
        {
          model: db.PathTheme,
          as: 'theme',
        },
        {
          model: db.Nutrient,
          as: 'nutrients',
          attributes: ['id'],
          through: { attributes: [] }, // Hide unwanted nested object from results
        },
      ],
    });
    // add foods and recommended foods properties
    // which you only need for a user's active path
    // (bc they are not displayed until you have selected the path).
    returnUser.activePath = {};
    if (user.activePath) {
      // get active path
      for (const property in user.activePath.dataValues) {
        returnUser.activePath[property] = user.activePath[property];
      }
      const highPotencyFoods = await getPathHighPotencyFoods(
        user.activePath.id
      );
      // not putting these properties on the model
      // since you only need them for active paths
      // and passing them through for all paths
      // would be way too much data.
      returnUser.activePath.highPotencyFoods = highPotencyFoods;
    }
    return res.status(200).json(returnUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to retrieve user data: ${error}` });
  }
});

app.put('/users/:userId', async (req, res) => {
  // Input: userId in params, authorization (token) and properties to update in the body.
  // Output: updated user object.
  // body should only include properties
  // that are to be updated. For example,
  // this will only update the user's email:

  const userId = req.params.userId;
  if (!userId) return res.status(401).json({ message: 'Must pass user id.' });

  // Could move this logic into a middleware function in router:
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

  // if date, convert for Sequelize
  let properties = {};
  for (const property in req.body) {
    if (property === 'birthday') {
      properties[property] = convertStringToDate(req.body[property]);
    } else {
      properties[property] = req.body[property];
    }
  }

  // Determine if user changes require path update
  // A user's path is determined based on pathName (mood, immunity, etc.),
  // if user menstruates and if user is vegan.
  // If user.isVegan or user.menstruates changes, their path must change to reflect this.
  // FYI The list of paths a user is allowed to choose from is also determined by
  // these user properties.

  let activePath;
  // If user is updating path, find new active path.
  if (activePathUpdated) {
    activePath = await db.Path.findOne({
      where: {
        id: req.body.activePathId,
      },
    });
  }
  // Else find existing active path if exists.
  else if (user.activePathId) {
    activePath = await db.Path.findOne({
      where: {
        id: user.activePathId,
      },
    });
  }
  // (Can't user !!isVegan because if it's false it will read the same as being undefined.)
  const isVeganUpdated = req.body.isVegan !== undefined;
  const menstruatesUpdated = req.body.menstruates !== undefined;
  const activePathUpdated = !!req.body.activePathId;
  const activePathIsCustom = activePath && activePath.ownerId === user.id;
  const activePathExists = !!activePath;
  // If user.activePathId, user.isVegan, or user.activePathId are
  // updated AND the path is not a custom path, make sure the path
  // is generated using the most up to date user data (path might not
  // exist if custom).
  if (
    (isVeganUpdated || menstruatesUpdated || activePathUpdated) &&
    !activePathIsCustom &&
    activePathExists
  ) {
    const isVegan =
      req.body.isVegan === undefined ? user.isVegan : req.body.isVegan;
    const menstruates =
      req.body.menstruates === undefined
        ? user.menstruates
        : req.body.menstruates;
    const pathName = activePath.name.toLowerCase().trim().split(' ')[0];
    // Generate new active path using updated user data.
    const updatedActivePath = await generateActivePath(
      menstruates,
      isVegan,
      pathName
    );
    // Update activePathId if new active path is different from old active path.
    if (updatedActivePath.id !== user.activePathId) {
      properties['activePathId'] = updatedActivePath.id;
    }
  }
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

app.get('/users/:userId/activePath/recipes/', async (req, res) => {
  // Gets activePath including recipes for a given user.
  // Input: userId in params, authorization (token) in body
  // Output: foods JSON object.

  const userId = req.params.userId;

  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

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

  if (!user.activePathId)
    return res.status(404).json({ message: 'No active path selected.' });

  try {
    // const nutrientsWithRecipes = await db.Nutrient.findAll({
    //   include: [
    //     {
    //       model: db.Recipe,
    //       as: 'recipes',
    //       where: {
    //         // filter out broken links
    //         [Op.or]: [
    //           {
    //             reportedByUserId: null,
    //           },
    //           {
    //             userReportIsVerified: null,
    //           },
    //           {
    //             userReportIsVerified: false,
    //           },
    //         ],
    //       },
    //     },
    //     {
    //       model: db.Path,
    //       as: 'paths',
    //       required: true,
    //       where: {
    //         id: user.activePathId,
    //       },
    //       attributes: [],
    //     },
    //   ],
    // });

    // Get nutrients in path:
    const pathNutrientIds = await db.PathNutrient.findAll({
      where: {
        pathId: user.activePathId,
      },
    }).map((pathNutrient) => {
      return pathNutrient.nutrientId;
    });
    const pathNutrients = await db.Nutrient.findAll({
      where: {
        id: pathNutrientIds,
      },
    });
    // Get recipes for each nutrient:
    let recipeIdsByNutrientId = {};
    const nutrientRecipes = await db.NutrientRecipe.findAll({
      where: {
        nutrientId: pathNutrientIds,
      },
    });
    nutrientRecipes.map((recipeNutrient) => {
      if (!recipeIdsByNutrientId[recipeNutrient.nutrientId]) {
        recipeIdsByNutrientId[recipeNutrient.nutrientId] = [];
      }
      recipeIdsByNutrientId[recipeNutrient.nutrientId].push(
        recipeNutrient.recipeId
      );
    });
    const activeRecipes = await db.Recipe.findAll({
      where: {
        // filter out recipes with broken links
        [Op.or]: [
          {
            reportedByUserId: null,
          },
          {
            userReportIsVerified: null,
          },
          {
            userReportIsVerified: false,
          },
        ],
      },
    });
    const recipesByNutrientId = {};
    // initialize
    pathNutrientIds.map((id) => {
      recipesByNutrientId[id] = [];
    });
    activeRecipes.map((recipe) => {
      pathNutrientIds.map((nutrientId) => {
        const nutrientRecipeIds = recipeIdsByNutrientId[nutrientId];
        if (!nutrientRecipeIds.includes(recipe.id)) return;
        recipesByNutrientId[nutrientId].push(recipe);
      });
    });
    let nutrientsWithRecipes = [];
    pathNutrients.map((nutrient) => {
      let nutrientWithRecipe = {};
      nutrientWithRecipe.name = nutrient.name;
      nutrientWithRecipe.id = nutrient.id;
      nutrientWithRecipe.recipes = recipesByNutrientId[nutrient.id];
      nutrientsWithRecipes.push(nutrientWithRecipe);
    });
    return res.status(200).json(nutrientsWithRecipes);
  } catch (error) {
    return res.status(500).json({
      message: `Server error: failed to retrieve user's activePath recipes: ${error}`,
    });
  }
});

// unused endpoint.
// app.get('/users/:userId/custompath', async (req, res) => {
//   // Input: userId as a param and authorization (token) in the body.
//   // Output: user's custom path object or 404.
//   const userId = req.params.userId;
//   if (!userId) return res.status(401).json({ message: 'Must pass user id.' });

//   // could move this logic into a middleware function in router:
//   // User can only get data of user they are signed in as:
//   const loggedInUserId = checkUserSignedIn(req);
//   if (!loggedInUserId || parseInt(userId) !== loggedInUserId) {
//     return res.status(401).json({
//       message: 'You must be logged in to complete this request.',
//     });
//   }
//   try {
//     const customPath = await db.Path.findOne({
//       where: {
//         ownerId: userId,
//       },
//       include: [
//         {
//           model: db.PathTheme,
//           as: 'theme',
//         },
//         {
//           model: db.Nutrient,
//           attributes: ['id'],
//           as: 'nutrients',
//           through: { attributes: [] }, // Hide unwanted nested object from results
//         },
//       ],
//     });
//     if (!customPath)
//       return res.status(404).json({ message: 'Custom path not found.' });
//     return res.status(200).json(customPath);
//   } catch (error) {
//     return res.status(500).json({
//       message: `Could not complete custom path request. Error: ${error}.`,
//     });
//   }
// });

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
      // update if changes
      if (customPath.name !== pathName) {
        customPath = await db.Path.update(
          { name: pathName },
          {
            where: {
              id: customPath.id,
            },
          }
        );
      }
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
    // update nutrients
    const nutrientsUpdated = await updatePathNutrients(
      customPath.id,
      nutrientIds
    );
    // set custom path as user's active path
    const userUpdated = await db.User.update(
      { activePathId: customPath.id },
      {
        where: {
          id: userId,
        },
      }
    );
    if (nutrientsUpdated && userUpdated) {
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

app.get('/users/:userId/foods/', async (req, res) => {
  // Gets all foods eaten by a given user.
  // Input: userId in params, authorization (token) in body
  // Optional input: limit, dateRange in query string
  // Output: foods JSON object.
  // dateRange options:
  // currentDay,

  const userId = req.params.userId;
  const dateRange = req.query.dateRange;
  //TODO learn about and implement pagination.
  const limit = parseInt(req.query.limit || 1000);

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
    let fromTime;
    let toTime;
    if (dateRange === 'currentDay') {
      fromTime = getRelativeDateTime('add', 0, 'days', 'startOfDay');
      toTime = getRelativeDateTime('add', 0, 'days', 'endOfDay');
    } else {
      // fromTime by default way in the past
      fromTime = getRelativeDateTime('subtract', 100, 'years', 'startOfDay');
      // toTime by default way in the future
      toTime = getRelativeDateTime('add', 2, 'days', 'startOfDay');
    }
    const foodIds = await db.UserFood.findAll({
      where: {
        userId: user.id,
        createdAt: {
          [Op.between]: [fromTime, toTime],
        },
      },
      order: [['createdAt', 'DESC']],
      limit: limit * 2,
    }).map((userFood) => {
      return userFood.foodId;
    });
    const foods = await db.Food.findAll({
      where: {
        id: foodIds,
      },
      // include: [
      //   {
      //     model: db.User,
      //     as: 'users',
      //     required: true,
      //     where: {
      //       id: userId,
      //     },
      //     attributes: ['id'],
      //     through: { attributes: ['createdAt'] },
      //     order: [['UserFood.createdAt', 'DESC']],
      //   },
      // ],
      limit: limit,
    });
    return res.status(200).json(foods);
  } catch (error) {
    return res.status(500).json({
      message: `Server error: failed to retrieve foods: ${error}`,
    });
  }
});

app.post('/users/:userId/recipes/', async (req, res) => {
  // Adds user recipe record.
  // Input: userId in params, authorization (token), recipeId in body
  // Output: http success/failure status.
  const userId = req.params.userId;
  const recipeId = req.body.recipeId;
  if (!userId)
    return res.status(401).json({ message: 'Must pass userId in params.' });

  if (!recipeId)
    return res.status(401).json({ message: 'Must pass recipeId in body.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  // Check that record doesn't already exist.
  const record = await db.UserRecipe.findOne({
    where: {
      userId: userId,
      recipeId: recipeId,
    },
  });
  if (record)
    return res.status(200).json({ message: 'Recipe already favorited.' });

  // Check that recipe exists.
  const recipe = await db.Recipe.findOne({
    where: {
      id: recipeId,
    },
  });
  if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

  try {
    const user = await db.User.findOne({
      where: {
        id: userId,
      },
    });
    const recipeAdded = await user.addRecipe(recipe);
    if (recipeAdded) {
      return res
        .status(200)
        .json({ message: 'Successfully favorited recipe.' });
    } else {
      return res.status(500).json({
        message:
          'Server error: failed to favorite recipe. Does user recipe record already exist?',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Server error: failed to favorite recipe: ${error}` });
  }
});

app.delete('/users/:userId/recipes/', async (req, res) => {
  // Deletes user recipe record.
  // Input: userId in params, authorization (token) and recipeId in body
  // Output: http success/failure status.
  const userId = req.params.userId;
  const recipeId = req.body.recipeId;
  if (!userId)
    return res.status(401).json({ message: 'Must pass userId in params.' });

  if (!recipeId)
    return res.status(401).json({ message: 'Must pass userFoodId in body.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  const record = await db.UserRecipe.findOne({
    where: {
      userId: userId,
      recipeId: recipeId,
    },
  });
  if (!record)
    return res.status(200).json({
      message:
        'Recipe did not appear to be favorited by user. No action was taken.',
    });
  try {
    const recordDeleted = await db.UserRecipe.destroy({
      where: {
        userId: userId,
        recipeId: recipeId,
      },
    });
    if (!recordDeleted) {
      return res.status(500).json({
        message: `Server error: failed to remove favorite from recipe.`,
      });
    }
    return res
      .status(200)
      .json({ message: 'Successfully removed favorite from recipe.' });
  } catch (error) {
    return res.status(500).json({
      message: `Server error: failed to remove favorite from recipe: ${error}`,
    });
  }
});

app.get('/users/:userId/recipes/', async (req, res) => {
  // Gets all favorited recipes for a given user.
  // Input: userId in params, authorization (token) in body
  // Output: foods JSON object.

  const userId = req.params.userId;

  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

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
    include: [
      {
        model: db.Recipe,
        as: 'recipes',
        required: false,
        where: {
          // filter out recipes with broken links.
          [Op.or]: [
            {
              reportedByUserId: null,
            },
            {
              userReportIsVerified: null,
            },
            {
              userReportIsVerified: false,
            },
          ],
        },
      },
    ],
  });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  try {
    return res.status(200).json(user.recipes || []);
  } catch (error) {
    return res.status(500).json({
      message: `Server error: failed to retrieve user's favorited recipes: ${error}`,
    });
  }
});

app.get('/users/:userId/userfoods/', async (req, res) => {
  // Gets all UserFood (meal) records for a given user.
  // Input: userId in params, authorization (token) in body
  // Optional input: limit, dateRange in query string
  // Output: foods JSON object.
  // dateRange options:
  // currentDay,

  const userId = req.params.userId;
  const dateRange = req.query.dateRange;

  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

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
    //TODO learn about and implement pagination.
    const limit = parseInt(req.query.limit || 1000);
    let fromTime;
    let toTime;
    if (dateRange === 'currentDay') {
      fromTime = getRelativeDateTime('add', 0, 'days', 'startOfDay');
      toTime = getRelativeDateTime('add', 0, 'days', 'endOfDay');
    } else {
      // fromTime by default way in the past
      fromTime = getRelativeDateTime('subtract', 100, 'years', 'startOfDay');
      // toTime by default way in the future
      toTime = getRelativeDateTime('add', 2, 'days', 'startOfDay');
    }
    // end fix dates
    const userFoods = await db.UserFood.findAll({
      where: {
        userId: user.id,
        createdAt: {
          [Op.between]: [fromTime, toTime],
        },
      },
      order: [['createdAt', 'DESC']],
      limit: limit,
    });
    return res.status(200).json(userFoods);
  } catch (error) {
    return res.status(500).json({
      message: `Server error: failed to retrieve user's userFood (meal) records: ${error}`,
    });
  }
});

app.post('/users/:userId/userfoods/', async (req, res) => {
  // Adds user food record.
  // Input: userId in params, authorization (token), foodId and servingsCount in body
  // Output: http success/failure status.
  const userId = req.params.userId;
  const foodId = req.body.foodId;
  const servingsCount = parseFloat(req.body.servingsCount);
  if (!userId)
    return res.status(401).json({ message: 'Must pass userId in params.' });

  if (!foodId)
    return res.status(401).json({ message: 'Must pass foodId in body.' });

  if (!servingsCount)
    return res
      .status(401)
      .json({ message: 'Must pass servingsCount in body.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  const food = await db.Food.findOne({
    where: {
      id: foodId,
    },
  });
  if (!food) return res.status(404).json({ message: 'Food not found.' });

  try {
    const recordCreated = await db.UserFood.create({
      userId: userId,
      foodId: foodId,
      servingsCount: servingsCount,
    });
    console.log(`record: ${recordCreated}`);
    if (recordCreated) {
      return res.status(200).json({ message: 'Successfully recorded meal.' });
    } else {
      return res
        .status(500)
        .json({ message: 'Server error: failed to record meal.' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Server error: failed to record meal: ${error}` });
  }
});

app.delete('/users/:userId/userfoods/', async (req, res) => {
  // Deletes user food record.
  // Input: userId in params, authorization (token) and userFoodId in body
  // Output: http success/failure status.
  const userId = req.params.userId;
  const userFoodId = req.body.userFoodId;
  if (!userId)
    return res.status(401).json({ message: 'Must pass userId in params.' });

  if (!userFoodId)
    return res.status(401).json({ message: 'Must pass userFoodId in body.' });

  // could move this logic into a middleware function in router:
  // User can only post data to user they are signed in as:
  const loggedInUserId = checkUserSignedIn(req);
  if (!loggedInUserId || parseInt(req.params.userId) !== loggedInUserId) {
    return res.status(401).json({
      message: 'You must be logged in to complete this request.',
    });
  }
  const record = await db.UserFood.findOne({
    where: {
      id: userFoodId,
    },
  });
  if (!record) {
    return res
      .status(200)
      .json({ message: `UserFood record was not found. No action taken.` });
  }
  try {
    const recordDeleted = await db.UserFood.destroy({
      where: {
        id: userFoodId,
      },
    });
    if (!recordDeleted) {
      return res
        .status(500)
        .json({ message: `Server error: failed to delete meal.` });
    }
    return res.status(200).json({ message: 'Successfully deleted meal.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Server error: failed to delete meal: ${error}` });
  }
});

app.get('/users/:userId/progressreport/daily', async (req, res) => {
  // Gets report of user's intake of each nutrient in their path.
  // Input: userId in params, authorization (token) in body
  // Output: report JSON object.

  const userId = req.params.userId;

  if (!req.params.userId)
    return res.status(401).json({ message: 'Must pass user id.' });

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
    // Get user's path.
    const userPath = await db.Path.findOne({
      where: {
        id: user.activePathId,
      },
      include: [
        {
          model: db.Nutrient,
          as: 'nutrients',
        },
      ],
    });
    const pathNutrients = userPath.nutrients.map((nutrient) => {
      return nutrient;
    });
    // Get user food records for the day.
    const startOfDay = getRelativeDateTime('add', 0, 'days', 'startOfDay');
    const endOfDay = getRelativeDateTime('add', 0, 'days', 'endOfDay');
    // Get all userfood records for the day.
    const userFoods = await db.UserFood.findAll({
      where: {
        userId: userId,
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });
    // Get all foods in those records.
    const foodIds = userFoods.map((userFood) => {
      return userFood.foodId;
    });
    const foods = await db.Food.findAll({
      where: {
        id: foodIds,
      },
      include: [
        {
          model: db.Nutrient,
          as: 'nutrients',
          required: true,
          attributes: ['name', 'dvNote', 'id'],
          through: { attributes: ['percentDvPerServing'] },
        },
      ],
    });
    // Initialize: foodsById hash.
    let foodsById = {};
    foods.map((food) => {
      foodsById[food.id] = {};
      foodsById[food.id].name = food.name;
      foodsById[food.id].servingSize = food.servingSize;
      foodsById[food.id].nutrients = food.nutrients;
      foodsById[food.id].servingsConsumed = 0;
      foodsById[food.id].consumedFoods = [];
    });
    // Get userfoods and calculate the sums of servings consumed for each food and put in hash.
    userFoods.map((userFood) => {
      // Create custom food record with extra info for the progress screen in the front end.
      const consumedFood = {
        id: userFood.foodId,
        name: foodsById[userFood.foodId].name,
        servingSize: foodsById[userFood.foodId].servingSize || '',
        nutrients: foodsById[userFood.foodId].nutrients,
        userFoodId: userFood.id,
        userFoodServingsCount: userFood.servingsCount,
        userFoodCreatedAt: userFood.createdAt,
      };
      foodsById[userFood.foodId].servingsConsumed =
        foodsById[userFood.foodId].servingsConsumed +
        parseFloat(userFood.servingsCount);
      foodsById[userFood.foodId].consumedFoods.push(consumedFood);
    });
    let nutrientReportById = {};
    foods.map((food) => {
      foodsById[food.id].nutrients.map((nutrient) => {
        if (!nutrientReportById[nutrient.id]) {
          nutrientReportById[nutrient.id] = {};
          nutrientReportById[nutrient.id].nutrientName = nutrient.name;
          nutrientReportById[nutrient.id].nutrientDvNote = nutrient.dvNote;
          nutrientReportById[nutrient.id].id = nutrient.id;
          nutrientReportById[nutrient.id].percentDvConsumed = 0;
          nutrientReportById[nutrient.id].consumedFoods = [];
        }
        nutrientReportById[nutrient.id].percentDvConsumed +=
          foodsById[food.id].servingsConsumed *
          nutrient.NutrientFood.percentDvPerServing;
        nutrientReportById[nutrient.id].consumedFoods = nutrientReportById[
          nutrient.id
        ].consumedFoods.concat(foodsById[food.id].consumedFoods);
      });
    });
    // Reduce report from all nutrients in the food eaten to
    // only nutrients in path.
    let report = {};
    let nutrientReports = [];
    let reportPercentDvConsumedSum = 0.0;
    pathNutrients.map((nutrient) => {
      // If user hasn't eaten any foods containing the given nutrient
      // there will be no nutrientReportById record for that nutrient.
      // In this case, create an empty report for the nutrient.
      if (!nutrientReportById[nutrient.id]) {
        const nutrientReport = {
          nutrientId: nutrient.id,
          nutrientName: nutrient.name,
          nutrientDvNote: nutrient.dvNote,
          percentDvConsumed: 0,
          consumedFoods: [],
        };
        nutrientReports.push(nutrientReport);
        return;
      }
      let nutrientReport = nutrientReportById[nutrient.id];
      nutrientReport.percentDvConsumed = parseFloat(
        nutrientReportById[nutrient.id].percentDvConsumed
      ).toFixed(2);
      nutrientReports.push(nutrientReport);
      // Make sure each nutrient's percentDvConsumed caps out at 100%.
      const percentDvConsumed =
        nutrientReportById[nutrient.id].percentDvConsumed > 1
          ? 1
          : nutrientReportById[nutrient.id].percentDvConsumed;
      reportPercentDvConsumedSum += parseFloat(percentDvConsumed);
    });
    report.nutrientsTotalDvConsumed = parseFloat(
      reportPercentDvConsumedSum / pathNutrients.length
    ).toFixed(2);
    report.nutrientReports = nutrientReports;
    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({
      message: `Server error: failed to retrieve daily progress report: ${error}`,
    });
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
