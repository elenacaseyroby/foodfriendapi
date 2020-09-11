import { db } from '../../models';
import { differenceOfTwoArrays } from '../../utils/common';

export async function updatePathNutrients(pathId, nutrientIdsList) {
  const savedNutrientIdsList = await db.PathNutrient.findAll({
    where: {
      pathId: pathId,
    },
  }).map((nutrientPath) => {
    return nutrientPath.nutrientId;
  });
  // Add nutrient to benefit if in nutrientIdsList and not already saved.
  const idsToCreate = differenceOfTwoArrays(
    nutrientIdsList,
    savedNutrientIdsList
  );
  let newPathNutrients = [];
  if (idsToCreate.length > 0) {
    try {
      newPathNutrients = idsToCreate.map((nutrientId) => {
        db.PathNutrient.create({
          pathId: pathId,
          nutrientId: nutrientId,
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
  // Remove nutrient from benefit if saved but not in nutrientIdsList.
  const idsToDelete = differenceOfTwoArrays(
    savedNutrientIdsList,
    nutrientIdsList
  );
  if (idsToDelete.length > 0) {
    try {
      idsToDelete.map((nutrientId) => {
        db.PathNutrient.destroy({
          where: {
            pathId: pathId,
            nutrientId: nutrientId,
          },
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
  if (idsToCreate.length + idsToDelete.length > 0) {
    console.log(
      `path id: ${pathId}; added nutrients ids: ${idsToCreate}; deleted nutrients: ${idsToDelete}`
    );
  }
  return newPathNutrients;
}
export function getVeganPaths(allPaths) {
  let pathsByName = {};
  allPaths.map((path) => {
    pathsByName[path.name.toLowerCase().trim()] = path;
  });
  let veganPaths = [];
  allPaths.map((path) => {
    // remove paths for menstruation
    if (path.name.toLowerCase().includes('menstruation')) return;
    // add path if vegan variation on path OR if vegan variation on path does not exist
    if (!pathsByName[`${path.name.toLowerCase().trim()} for vegans`]) {
      veganPaths.push(path.id);
    }
  });
  return veganPaths;
}
export function getMenstruationPaths(allPaths) {
  let pathsByName = {};
  allPaths.map((path) => {
    pathsByName[path.name.toLowerCase().trim()] = path;
  });
  let menstruationPaths = [];
  allPaths.map((path) => {
    // remove paths for vegans
    if (path.name.toLowerCase().includes('vegan')) return;
    // add path if menstruation variation on path OR if menstruation variation on path does not exist
    if (!pathsByName[`${path.name.toLowerCase().trim()} for menstruation`]) {
      menstruationPaths.push(path.id);
    }
  });
  return menstruationPaths;
}
export function getDefaultPaths(allPaths) {
  let defaultPaths = [];
  allPaths.map((path) => {
    // add path if name is one word (default path)
    if (path.name.trim().split(' ').length === 1) {
      defaultPaths.push(path.id);
    }
  });
  return defaultPaths;
}

export async function generateActivePath(menstruates, isVegan, pathName) {
  // Filter paths based on user properties (isVegan and menstruates).
  const userPaths = await filterUserPaths(isVegan, menstruates);
  let activePath;
  // Find the path in filtered list whose name (ex. mood for vegans, mood for menstruation)
  // contains the pathName (ex. mood, energy, etc) that the user has chosen.
  userPaths.map((path) => {
    if (path.name.toLowerCase().includes(pathName.toLowerCase())) {
      activePath = path;
    }
  });
  return activePath;
}

export async function filterUserPaths(isVegan, menstruates) {
  // This function filters paths based on user properties (isVegan and menstruates).
  // Will always return a list with one path for each theme:
  // mood, energy, beauty, cognition, immunity, etc.
  // Right now algorithm works based on filtering for paths with certain words in the name
  // But at some point we can make it more robust/less fragile.
  // As it stands, path names must always be in one of the following formats:
  // [Theme]
  // [Theme] for vegans
  // [Theme] for menstruation
  // ex. Mood, Mood for Vegans, Mood for Menstruation.
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
  let userPathIds;
  if (isVegan) {
    userPathIds = getVeganPaths(allPaths);
  } else if (menstruates) {
    userPathIds = getMenstruationPaths(allPaths);
  } else {
    userPathIds = getDefaultPaths(allPaths);
  }
  const userPaths = await db.Path.findAll({
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
  return userPaths;
}

// if you put this on the model, you will always need to
// query for associated nutrients and nutrientfoods when you
// query for a path. this is better, because more often, when we're
// querying for a path, we don't want the path foods.
// COULD MEMOIZE WITH EXTRA FUNC THAT TAKES IN LIST OF NUTRIENT IDS
// SO IT WILL ONLY RUN AGAIN IF NUTRIENT IDS CHANGE.
export async function getPathFoods(pathId) {
  const path = await db.Path.findOne({
    where: {
      id: pathId,
    },
    include: [
      {
        model: db.Nutrient,
        as: 'nutrients',
        through: { attributes: [] }, // Hide unwanted nested object from results
        include: {
          model: db.Food,
          as: 'foods',
          attributes: ['id', 'name', 'servingSizeNote'],
          through: { attributes: [] }, // Hide unwanted nested object from results
        },
      },
    ],
  });
  const addedFoodIds = [];
  const distinctFoodsInPath = [];
  path.nutrients.map((nutrient) => {
    nutrient.foods.map((food) => {
      // If food hasn't been added, add it.
      if (!addedFoodIds.includes(food.id)) {
        addedFoodIds.push(food.id);
        distinctFoodsInPath.push(food);
      }
    });
  });
  return distinctFoodsInPath;
}

// if you put this on the model, you will always need to
// query for associated nutrients and nutrientfoods when you
// query for a path. this is better, because more often, when we're
// querying for a path, we don't want the path recommended foods.
// COULD MEMOIZE WITH EXTRA FUNC THAT TAKES IN LIST OF NUTRIENT IDS
// SO IT WILL ONLY RUN AGAIN IF NUTRIENT IDS CHANGE.
export async function getPathHighPotencyFoods(pathId) {
  const path = await db.Path.findOne({
    where: {
      id: pathId,
    },
    include: [
      {
        model: db.Nutrient,
        as: 'nutrients',
        through: { attributes: [] }, // Hide unwanted nested object from results
        include: {
          model: db.Food,
          as: 'foods',
          attributes: ['id', 'name', 'servingSizeNote'],
          through: { attributes: [] }, // Hide unwanted nested object from results
        },
      },
    ],
  });
  const nutrientCountByFoodId = {};
  const foodsInAllPathNutrients = [];
  path.nutrients.map((nutrient) => {
    nutrient.foods.map((food) => {
      // If food doens't exist in hash, add it.
      if (!nutrientCountByFoodId[food.id]) {
        nutrientCountByFoodId[food.id] = 0;
      }
      // Bump up nutrient count for given food.
      nutrientCountByFoodId[food.id] += 1;
      // If food has every nutrient in path, add to array.
      if (nutrientCountByFoodId[food.id].length === path.nutrients.length) {
        foodsInAllPathNutrients.push(food);
      }
      console.log('----------------------');
      console.log(`nutrientCountByFoodId: ${nutrientCountByFoodId}`);
      console.log(`foods with all path nutrients: ${foodsInAllPathNutrients}`);
    });
  });
  // Return foods with every nutrient in path.
  return foodsInAllPathNutrients;
}
