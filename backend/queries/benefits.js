import { db } from '../models';
import { differenceOfTwoArrays } from '../utils/common';

export async function updateBenefitNutrients(benefitId, nutrientIdsList) {
  const savedNutrientIds = await db.NutrientBenefit.findAll({
    where: {
      benefit_id: benefitId,
    },
  }).map((nutrientBenefit) => {
    return nutrientBenefit.nutrient_id;
  });
  // Add nutrient to benefit if in nutrientIdsList and not already saved.
  const idsToCreate = differenceOfTwoArrays(nutrientIdsList, savedNutrientIds);
  let newNutrientBenefits = [];
  if (idsToCreate.length > 0) {
    try {
      newNutrientBenefits = idsToCreate.map((nutrientId) => {
        db.NutrientBenefit.create({
          benefit_id: benefitId,
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
        db.NutrientBenefit.destroy({
          where: {
            benefit_id: benefitId,
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
      `benefit id: ${benefitId}; added nutrients ids: ${idsToCreate}; deleted nutrients: ${idsToDelete}`
    );
  }
  return newNutrientBenefits;
}
