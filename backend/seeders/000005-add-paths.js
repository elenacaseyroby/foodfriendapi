module.exports = {
  // need for onboarding survey
  up: async (queryInterface, Sequelize) => {
    const path = await queryInterface.rawSelect('paths', {}, ['name']);
    if (path) return 'success';
    return queryInterface.sequelize.query(
      "\
      INSERT INTO `paths` (`id`, `name`, `owner_id`, `notes`, `notes_sources`, `created_at`, `updated_at`) VALUES \
('1', 'Mood', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('2', 'Energy', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('3', 'Energy For Menstruation', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('4', 'Cognition', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('5', 'Beauty', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('6', 'Immunity', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('7', 'Energy for Vegans', '1', 'B12 is important for energy, but is difficult to get from a vegan diet since its found in micro-organisms in food. If you are vegan and cannot get this nutrient through food, we recommend this supplement: []', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('8', 'Cognition for Vegans', '1', 'B12 is important for cognition, but is difficult to get from a vegan diet since its found in micro-organisms in food. If you are vegan and cannot get this nutrient through food, we recommend this supplement: []', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'), \
('9', 'Mood for Vegans', '1', 'Vitamin D is also good for your mood.  Try to spend 10-30 minutes a day in the sun to get your daily recommended value of Vitamin D.  Of course, the time needed for proper absorption varies by season, geolocation and skin tone.', 'https://www.healthline.com/nutrition/vitamin-d-from-sun', '2020-06-09 22:23:26', '2020-07-08 19:40:07'), \
('10', 'Immunity for Vegans', '1', '', '', '2020-06-09 22:23:26', '2020-06-09 22:23:26'); \
    "
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paths', null, {});
  },
};
