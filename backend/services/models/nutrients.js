import { db } from '../../models';

export function updateNutrients(nutrientsList) {
  // nutrientsList should be an array of objects.
  // each object must include an id
  // and any other properties that should be updated.

  // Individually update nutrients.
  // Doesn't appear to be a way to bulk update
  // distinct values.
  nutrientsList.map((nutrient) => {
    db.Nutrient.update(nutrient, {
      returning: true,
      where: { id: nutrient.id },
    }).then((nutrients) => {
      console.log(
        `Nutrient records updated: ${nutrientsList.map((nutrient) => {
          return nutrient.name;
        })}`
      );
      return nutrients;
    });
  });
}

export function createNewNutrients(nutrientsList) {
  // nutrientsList should be an array of objects.
  // each object must include any properties that
  // should be updated.

  // Bulk create nutrients.
  db.Nutrient.bulkCreate(nutrientsList).then((nutrients) => {
    console.log(
      `Nutrient records created: ${nutrientsList.map((nutrient) => {
        return nutrient.name;
      })}`
    );
    return nutrients;
  });
}
