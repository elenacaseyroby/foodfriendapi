import { db } from '../models';
import { differenceOfTwoArrays } from '../utils/common';

export function createNewBenefits(benefitsList) {
  db.Benefit.bulkCreate(benefitsList).then((benefits) => {
    console.log(
      `Benefit records created: ${benefitsList.map((benefit) => {
        return benefit.name;
      })}`
    );
    return benefits;
  });
}

export function updateBenefits(benefitsList) {
  // benefitsList should be an array of objects.
  // each object must include an id
  // and a name.

  // Individually update benefits.
  // Doesn't appear to be a way to bulk update
  // distinct values.
  benefitsList.map((benefit) => {
    db.Benefit.update(benefit, {
      returning: true,
      where: { id: benefit.id },
    }).then((benefits) => {
      console.log(
        `Benefit records updated: ${benefitsList.map((benefit) => {
          return benefit.name;
        })}`
      );
      return benefits;
    });
  });
}

export async function updateBenefitNutrients(benefitId, nutrientIdsList) {
  // BUG: add duplicate nutrient_benefits records
  const savedNutrientIds = await db.NutrientBenefit.findAll({
    where: {
      benefit_id: benefitId,
    },
  }).map((nutrientBenefit) => {
    return nutrientBenefit.nutrient_id;
  });
  // Add nutrient to benefit if in nutrientIdsList and not already saved.
  const idsToCreate = differenceOfTwoArrays(nutrientIdsList, savedNutrientIds);
  if (idsToCreate.length > 0) {
    idsToCreate.map((nutrientId) => {
      try {
        db.NutrientBenefit.create({
          benefit_id: benefitId,
          nutrient_id: nutrientId,
        });
      } catch (err) {
        console.log(err);
      }
    });
  }
  // Remove nutrient from benefit if saved but not in nutrientIdsList.
  const idsToDelete = differenceOfTwoArrays(savedNutrientIds, nutrientIdsList);
  if (idsToDelete.length > 0) {
    idsToDelete.map((nutrientId) => {
      try {
        db.NutrientBenefit.destroy({
          where: {
            benefit_id: benefitId,
            nutrient_id: nutrientId,
          },
        });
      } catch (err) {
        console.log(err);
      }
    });
  }
  console.log(
    `benefit id: ${benefitId}; added nutrients ids: ${idsToCreate}; deleted nutrients: ${idsToCreate}`
  );
}
