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
  const admin = await db.User.findOne({
    where: {
      email: 'admin@foodfriend.io',
    },
  });
  const allPaths = await db.Path.findAll({
    where: {
      ownerId: admin.id,
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
  let userPaths;
  if (isVegan) {
    userPaths = getVeganPaths(allPaths);
  } else if (menstruates) {
    userPaths = getMenstruationPaths(allPaths);
  } else {
    userPaths = getDefaultPaths(allPaths);
  }
  let activePath;
  allPaths.map((path) => {
    if (
      userPaths.includes(path.id) &&
      path.name.toLowerCase().includes(pathName.toLowerCase())
    ) {
      activePath = path;
    }
  });
  return activePath;
}