import { db } from '../../models';
import { differenceOfTwoArrays } from '../../utils/common';

export async function updateBenefitNutrients(benefitId, nutrientIdsList) {
  const savedNutrientIdsList = await db.NutrientBenefit.findAll({
    where: {
      benefitId: benefitId,
    },
  }).map((nutrientBenefit) => {
    return nutrientBenefit.nutrientId;
  });
  // Add nutrient to benefit if in nutrientIdsList and not already saved.
  const idsToCreate = differenceOfTwoArrays(
    nutrientIdsList,
    savedNutrientIdsList
  );
  let newNutrientBenefits = [];
  if (idsToCreate.length > 0) {
    try {
      newNutrientBenefits = idsToCreate.map((nutrientId) => {
        db.NutrientBenefit.create({
          benefitId: benefitId,
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
        db.NutrientBenefit.destroy({
          where: {
            benefitId: benefitId,
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
      `benefit id: ${benefitId}; added nutrients ids: ${idsToCreate}; deleted nutrients: ${idsToDelete}`
    );
  }
  return newNutrientBenefits;
}
