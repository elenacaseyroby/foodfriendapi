# foodfriend

## Run Migrations

`npx sequelize-cli db:migrate`
more migrations info here: https://docs.google.com/document/d/13pcDmpL_4E9p8kg74f2iCxOSaQpad7Gkacw3Z6AS-8A/edit?usp=sharing

## Uploading Data

#### local steps

- `cd foodfriend/backend`
- `npm start`

#### local and production steps

- Open the postman app
- Upload Nutrients. Nutrients can only be deleted directly through the db:
  - request: POST /upload-csv/nutrients
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **name** ,description,descriptionSources, **dvInMg,dvSource** ,sourceNote,warnings,warningsSources
- Upload Foods and NutrientFoods records. Will Add/Update Foods and Add/Update/delete NutrientFoods records:
  - request: POST /upload-csv/nutrient-foods
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **nutrientName,foodName,percentDvPerServing,dvSource**
- Upload Benefits and NutrientBenefits records. Will Add/Update Benefits and Add/Update/delete NutrientBenefits records:
  - request: POST /upload-csv/nutrient-benefits
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **benefitName,nutrientsList**
- Upload Recipes and NutrientRecipes records. Will Add/Update Recipes and Add/Update/delete NutrientRecipes records:
  - request: POST /upload-csv/nutrient-recipes
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **nutrientName,recipeName,url,imagePath,** trackableFoods, **sourceNote**
- Upload Paths and PathNutrients. Will Add/Update Paths and Add/Update/delete PathNutrients records:
  - request: POST /upload-csv/path-nutrients
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **pathName,nutrientsList** ,notes,notesSources,sourceNote,warnings,warningsSources
