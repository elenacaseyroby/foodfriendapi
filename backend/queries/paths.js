import { db } from '../models';
import { differenceOfTwoArrays } from '../utils/common';

export async function updatePathNutrients(pathId, nutrientIdsList) {
  const savedNutrientIds = await db.PathNutrient.findAll({
    where: {
      path_id: pathId,
    },
  }).map((nutrientPath) => {
    return nutrientPath.nutrient_id;
  });
  // Add nutrient to benefit if in nutrientIdsList and not already saved.
  const idsToCreate = differenceOfTwoArrays(nutrientIdsList, savedNutrientIds);
  let newPathNutrients = [];
  if (idsToCreate.length > 0) {
    try {
      newPathNutrients = idsToCreate.map((nutrientId) => {
        db.PathNutrient.create({
          path_id: pathId,
          nutrient_id: nutrientId,
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
  // Remove nutrient from benefit if saved but not in nutrientIdsList.
  const idsToDelete = differenceOfTwoArrays(savedNutrientIds, nutrientIdsList);
  if (idsToDelete.length > 0) {
    try {
      idsToDelete.map((nutrientId) => {
        db.PathNutrient.destroy({
          where: {
            path_id: pathId,
            nutrient_id: nutrientId,
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
