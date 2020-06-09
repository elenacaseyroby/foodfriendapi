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
- Upload Nutrients.  Nutrients can only be deleted directly through the db:
  - request: POST /upload-csv/nutrients
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **name** ,description,description_sources, **dv_in_mg,dv_source** ,source_note,warnings,warnings_sources
- Upload Foods and NutrientFoods records.  Will Add/Update Foods and Add/Update/delete NutrientFoods records:
  - request: POST /upload-csv/nutrient_foods
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **nutrient_name,food_name,percent_dv_per_serving,dv_source**
- Upload Benefits and NutrientBenefits records. Will Add/Update Benefits and Add/Update/delete NutrientBenefits records:
  - request: POST /upload-csv/nutrient_benefits
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **benefit_name,nutrients_list**
- Upload Recipes and NutrientRecipes records. Will Add/Update Recipes and Add/Update/delete NutrientRecipes records:
  - request: POST /upload-csv/nutrient_recipes
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **nutrient_name,recipe_name,url,image_path,** trackable_foods, **source_note**
- Upload Paths and PathNutrients.  Will Add/Update Paths and Add/Update/delete PathNutrients records:
  - request: POST /upload-csv/path_nutrients
  - body: uploadfile: file.csv
    - csv fields **(required in bold)**: **path_name,nutrients_list** ,notes,notes_sources,source_note,warnings,warnings_sources
