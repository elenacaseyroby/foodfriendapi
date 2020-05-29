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

export function updateBenefitNutrients(benefitId, nutrientIdsList) {
  // Get all saved nutrients joined to this benefit.
  const savedNutrientIds = db.NutrientBenefit.findAll({
    where: {
      benefit_id: benefitId,
    },
  }).map((nutrientBenefit) => {
    return nutrientBenefit.nutrient_id;
  });

  // Add nutrient to benefit if shown in CSV and not already saved.
  const idsToCreate = differenceOfTwoArrays(nutrientIdsList, savedNutrientIds);
  idsToCreate
    .map((nutrientId) => {
      // Get beneefit nutrients
      // create nutrients not in list
      // delete nutrients in saved list but not in csv list
      db.NutrientBenefit.create(
        {
          benefit_id: benefitId,
          nutrient_id: nutrientId,
        },
        {
          returning: true,
        }
      );
    })
    .then(() => {
      console.log(`benefit id:${benefitId}`);
      console.log(`list of nutrients (ids) added to benefit:${idsToCreate}`);
    });

  // Remove nutrient from benefit if saved but not shown in the CSV.
  const idsToDelete = differenceOfTwoArrays(savedNutrientIds, nutrientIdsList);
  idsToDelete.map((nutrientId) => {
    db.NutrientBenefit.destroy({
      where: {
        benefit_id: benefitId,
        nutrient_id: nutrientId,
      },
    }).then(() => {
      console.log(`benefit id:${benefitId}`);
      console.log(
        `list of nutrients (ids) removed from benefit:${idsToDelete}`
      );
    });
  });
}
