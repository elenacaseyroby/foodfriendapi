module.exports = {
  // need for onboarding survey
  up: async (queryInterface, Sequelize) => {
    // Only perform if the paths table is empty.
    const path = await queryInterface.rawSelect('paths', {}, ['name']);
    if (path) return 'success';
    return queryInterface.sequelize.query(
      "\
      INSERT INTO `paths` (`id`, `name`, `owner_id`, `notes`, `notes_sources`, `created_at`, `updated_at`, `description`, `theme_id`) VALUES \
('1', 'Mood', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those seeking a natural avenue towards emotional wellbeing. By tracking active nutrients like Vitamin B6, Vitamin D, and Magnesium, this path will help you improve your mood with food!', 2), \
('2', 'Energy', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking to add a natural energy boost to their daily routine. By tracking active nutrients like Vitamin B12, Vitamin D, and Magnesium, this path will help you to stay energized!', 5), \
('3', 'Energy For Menstruation', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking to add a natural energy boost to their daily routine. By tracking active nutrients like Vitamin B12, Vitamin D, and Magnesium, this path will help you to stay energized!', 5), \
('4', 'Cognition', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking for a brain boost. By tracking active nutrients like Omega-3, Vitamin B12, and Niacin, this path will help you to stay focused and mentally prepared. Keep your brain on its toes!', 3), \
('5', 'Beauty', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking for a boost in their beauty routine. By tracking active nutrients like Vitamin A, Vitamin E, and Biotin, this path will help you maintain your skin, hair, and nails.', 4), \
('6', 'Immunity', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking for an immunity boost. By tracking active nutrients like Vitamin C, Calcium, and Vitamin D, this path will help you to boost your natural immunity and stay healthy!', 6), \
('7', 'Energy for Vegans', '1', 'B12 is important for energy, but is difficult to get from a vegan diet since its found in micro-organisms in food. If you are vegan and cannot get this nutrient through food, we recommend this supplement: []', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking to add a natural energy boost to their daily routine. By tracking active nutrients like Vitamin B12, Vitamin D, and Magnesium, this path will help you to stay energized!', 5), \
('8', 'Cognition for Vegans', '1', 'B12 is important for cognition, but is difficult to get from a vegan diet since its found in micro-organisms in food. If you are vegan and cannot get this nutrient through food, we recommend this supplement: []', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking for a brain boost. By tracking active nutrients like Omega-3, Vitamin B12, and Niacin, this path will help you to stay focused and mentally prepared. Keep your brain on its toes!', 3), \
('9', 'Mood for Vegans', '1', 'Vitamin D is also good for your mood.  Try to spend 10-30 minutes a day in the sun to get your daily recommended value of Vitamin D.  Of course, the time needed for proper absorption varies by season, geolocation and skin tone.', 'https://www.healthline.com/nutrition/vitamin-d-from-sun', '2020-06-09 22:23:26', '2020-07-08 19:40:07', 'This path is designed for those seeking a natural avenue towards emotional wellbeing. By tracking active nutrients like Vitamin B6, Vitamin D, and Magnesium, this path will help you improve your mood with food!', 2), \
('10', 'Immunity for Vegans', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26', 'This path is designed for those looking for an immunity boost. By tracking active nutrients like Vitamin C, Calcium, and Vitamin D, this path will help you to boost your natural immunity and stay healthy!', 6); \
    "
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paths', null, {});
  },
};
