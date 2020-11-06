module.exports = {
  // App will run without this. It's just a nice to have.
  up: async (queryInterface, Sequelize) => {
    // Only run if recipes table is empty.
    const recipes = await queryInterface.rawSelect('recipes', {}, [
      'id',
    ]);
    if (recipes) return 'success';
    return queryInterface.sequelize.query(" \
    INSERT INTO `recipes` (`created_at`, `id`, `image_path`, `name`, `reported_by_user_id`, `source_note`, `trackable_foods`, `updated_at`, `url`, `user_report_is_verified`) VALUES \
    ('2020-10-05 19:18:12', '1', 'tuna_salad.jpg', 'Tuna Salad', NULL, 'Culinary Hill', 'tuna, mayonnaise', '2020-10-05 19:18:12', 'https://www.culinaryhill.com/classic-tuna-salad-sandwich/', NULL), \
    ('2020-10-05 19:18:12', '2', 'vegan_mac_n_cheese.jpg', 'Vegan Mac n Cheese', NULL, 'Minimalist Baker', 'nutritional yeast, oatmilk', '2020-10-05 19:18:12', 'https://minimalistbaker.com/best-vegan-gluten-free-mac-n-cheese/', NULL), \
    ('2020-10-05 19:18:12', '3', 'pea_pancakes.jpg', 'Pea Pancakes', NULL, 'Bon Appetit', 'green peas, cottage cheese', '2020-10-05 19:18:12', 'https://www.bonappetit.com/recipe/pea-pancakes', NULL), \
    ('2020-10-05 19:18:12', '4', 'crispy_peanut_tofu.jpg', 'Crispy Peanut Tofu', NULL, 'Minimalist Baker', 'peanuts, fortified tofu, cauliflower', '2020-10-05 19:18:12', 'https://minimalistbaker.com/crispy-peanut-tofu-cauliflower-rice-stir-fry/', NULL), \
    ('2020-10-05 19:18:12', '5', 'ham_omelette.jpeg', 'Ham & Cheese Omelette', NULL, 'Serious Eats', 'egg, ham, swiss cheese', '2020-10-05 19:18:12', 'https://www.seriouseats.com/recipes/2016/04/diner-style-ham-and-cheese-omelette-for-two-recipe-food-lab.html', NULL), \
    ('2020-10-05 19:18:12', '6', 'curried_sweet_potato_chickpeas.jpg', 'Curried Sweet Potato Chickpeas', NULL, 'Minimalist Baker', 'chickpeas, sweet potato', '2020-10-05 19:18:12', 'https://minimalistbaker.com/sheet-pan-meal-curried-sweet-potato-chickpeas/', NULL), \
    ('2020-10-05 19:18:12', '7', 'chickpea_shakshuka.jpg', 'Amazing Chickpea Shakshuka', NULL, 'Minimalist Baker', 'chickpeas, marinara sauce', '2020-10-05 19:18:12', 'https://minimalistbaker.com/1-pot-chickpea-shakshuka/', NULL), \
    ('2020-10-05 19:18:12', '8', 'chickpea_chana_masala.jpg', 'Easy Chana Masala', NULL, 'Minimalist Baker', 'chickpeas', '2020-10-05 19:18:12', 'https://minimalistbaker.com/easy-chana-masala/', NULL), \
    ('2020-10-05 19:18:12', '9', 'acorn_squash_soup.jpg', 'Acorn Squash Soup Bowls', NULL, 'Minimalist Baker', 'acorn squash', '2020-10-05 19:18:12', 'https://minimalistbaker.com/creamy-fall-soup-in-acorn-squash-bowls/', NULL), \
    ('2020-10-05 19:18:12', '10', 'swiss_meusli.png', 'Swiss Meusli', NULL, 'Just a Pinch', 'swiss meusli', '2020-10-05 19:18:12', 'https://www.justapinch.com/recipes/breakfast/fruit-breakfast/homemade-swiss-muesli-cereal.html', NULL), \
    ('2020-10-05 19:18:12', '11', 'super_seedy_granola_bars.jpg', 'Super Seedy Granola Bars', NULL, 'Minimalist Baker', 'flaxseeds, chia seeds, sunflower seeds, hemp seeds, walnut, peanut butter', '2020-10-05 19:18:12', 'https://minimalistbaker.com/super-seedy-granola-bars/', NULL), \
    ('2020-10-05 19:18:12', '12', 'grilled_oysters.jpg', 'Grilled Oysters', NULL, 'Bon Appetit', 'oysters', '2020-10-05 19:18:12', 'https://www.bonappetit.com/recipe/grilled-oysters', NULL), \
    ('2020-10-05 19:18:12', '13', 'vegan_slow_cooker_mole.png', 'Vegan Slow Cooker Mole', NULL, 'Healthy Slow Cooking', 'dark chocolate, mushrooms', '2020-10-05 19:18:12', 'https://healthyslowcooking.com/vegan-slow-cooker-mole-mushroom-taco-filling-huaraches-and-my-trip-to-cancun/', NULL), \
    ('2020-10-05 19:18:12', '14', 'kale_white_bean_artichoke_dip.jpg', 'Kale White Bean Artichoke Dip', NULL, 'Minimalist Baker', 'white beans, kale, artichoke', '2020-10-05 19:18:12', 'https://minimalistbaker.com/kale-white-bean-artichoke-dip/', NULL), \
    ('2020-10-05 19:18:12', '15', 'thyme_white_bean_pot_pies.jpg', 'Thyme White Bean Pot Pies', NULL, 'Minimalist Baker', 'white beans', '2020-10-05 19:18:12', 'https://minimalistbaker.com/thyme-white-bean-pot-pies/', NULL), \
    ('2020-10-05 19:18:12', '16', '20_min_stir_fry.jpg', '20 Minute Stir Fry', NULL, 'Minimalist Baker', 'tofu', '2020-10-05 19:18:12', 'https://minimalistbaker.com/20-minute-tofu-stir-fry/', NULL), \
    ('2020-10-05 19:18:12', '17', 'pumpkin_seed_pesto.jpg', 'Vegan Pumpkin Seed Pesto', NULL, 'Drive Me Hungry', 'pumpkin seeds', '2020-10-05 19:18:12', 'https://drivemehungry.com/vegan-pumpkin-seed-pesto-with-parsley-and-basil/', NULL), \
    ('2020-10-05 19:18:12', '18', 'red_pumpkin_seed_mole.jpg', 'Red Pumpkin Seed Mole', NULL, 'Washington Post', 'pumpkin seeds', '2020-10-05 19:18:12', 'https://www.washingtonpost.com/recipes/roasted-squash-pumpkin-seed-mole/15540/', NULL), \
    ('2020-10-05 19:18:12', '19', 'green_pumpkin_seed_mole.jpg', 'Green Pumpkin Seed Mole', NULL, 'Leite`s Culinaria', 'pumpkin seeds', '2020-10-05 19:18:12', 'https://leitesculinaria.com/74276/recipes-pumpkin-seed-mole.html', NULL), \
    ('2020-10-05 19:18:12', '20', 'black_bean_quinoa_croquettes.png', 'Black Bean Quinoa Croquettes', NULL, 'Dreena Burton', 'pumpkin seeds, black beans, quinoa', '2020-10-05 19:18:12', 'https://dreenaburton.com/black-bean-sweet-potato-and-quinoa-croquettes-with-pumpkin-seed-chipotle-cream-vegan-and-gluten-free/', NULL), \
    ('2020-10-05 19:18:12', '21', 'black_bean_quinoa_falafel.jpg', 'Black Bean Quinoa Falafel', NULL, 'Minimalist Baker', 'black beans, quinoa', '2020-10-05 19:18:12', 'https://minimalistbaker.com/baked-quinoa-black-bean-falafel/', NULL), \
    ('2020-10-05 19:18:12', '22', 'vegan_lentil_fesenjan.jpg', 'Vegan Lentil Walnut Fesenjan', NULL, 'Minimalist Baker', 'lentils, walnuts', '2020-10-05 19:18:12', 'https://minimalistbaker.com/vegan-lentil-fesenjan/', NULL), \
    ('2020-10-05 19:18:12', '23', 'vegan_walnut_taco_meat.jpg', 'Vegan Walnut Taco \"Meat\"', NULL, 'Minimalist Baker', 'walnuts', '2020-10-05 19:18:12', 'https://minimalistbaker.com/10-minute-raw-vegan-taco-meat/', NULL), \
    ('2020-10-05 19:18:12', '24', 'paleo_flaxseed_oatmeal.jpg', 'Overnight Flaxseed Oatmeal', NULL, 'I Heart Umami', 'flaxseeds', '2020-10-05 19:18:12', 'https://iheartumami.com/paleo-oatmeal/', NULL), \
    ('2020-10-05 19:18:12', '25', 'espresso_walnut_brownies.jpg', 'Espresso Walnut Brownies', NULL, 'Minimalist Baker', 'walnuts, dark chocolate', '2020-10-05 19:18:12', 'https://minimalistbaker.com/5-minute-espresso-walnut-brownies/', NULL), \
    ('2020-10-05 19:18:12', '26', 'sweet_potato_toast.jpg', 'Sweet Potato Toast', NULL, 'Detoxinista', 'sweet potato', '2020-10-05 19:18:12', 'https://detoxinista.com/sweet-potato-toast/', NULL), \
    ('2020-10-05 19:18:12', '27', 'white_mushroom_asparagus_pasta.jpg', 'White Mushroom Asparagus Pasta', NULL, 'Minimalist Baker', 'white mushrooms, asparagus', '2020-10-05 19:18:12', 'https://minimalistbaker.com/creamy-mushroom-asparagus-pasta/', NULL), \
    ('2020-10-05 19:18:12', '28', 'salmon_salsa_verde.jpg', 'Roasted Salmon Salsa Verde', NULL, 'Bon Appetit', 'salmon', '2020-10-05 19:18:12', 'https://www.bonappetit.com/recipe/roasted-salmon-salsa-verde', NULL), \
    ('2020-10-05 19:18:12', '29', 'salmon_scallions_and_sesame.jpg', 'Broiled Salmon with Scallions and Sesame', NULL, 'Bon Appetit', 'salmon, sesame seeds', '2020-10-05 19:18:12', 'https://www.bonappetit.com/recipe/broiled-salmon-with-scallions-and-sesame', NULL), \
    ('2020-10-05 19:18:12', '30', 'balsalmic_portabello_burgers.png', 'Balsalmic Portabello Burgers', NULL, 'Minimalist Baker', 'portabello mushrooms, onion, tomatoes', '2020-10-05 19:18:12', 'https://minimalistbaker.com/balsamic-portobello-burgers-with-caramelized-onions-garlic-aioli/', NULL), \
    ('2020-10-05 19:18:12', '31', 'portabello_butternut_squash_tacos.jpg', 'Portabello Butternut Squash Tacos', NULL, 'Minimalist Baker', 'portabello mushrooms, butternut squash', '2020-10-05 19:18:12', 'https://minimalistbaker.com/saucy-portobello-butternut-squash-tacos/', NULL);");
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('recipes', null, {});
  },
};