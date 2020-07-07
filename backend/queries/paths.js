import { db } from '../models';
import { differenceOfTwoArrays } from '../utils/common';

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
