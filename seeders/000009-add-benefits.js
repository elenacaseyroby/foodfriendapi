module.exports = {
  // App will run without this. It's just a nice to have.
  up: async (queryInterface, Sequelize) => {
    // Only perform if the benefits table is empty
    const benefit = await queryInterface.rawSelect('benefits', {}, [
      'id',
    ]);
    if (benefit) return 'success';
    return queryInterface.sequelize.query(" \
      INSERT INTO `benefits` (`created_at`, `id`, `name`, `updated_at`) VALUES \
      ('2020-10-05 19:17:10', '1', 'Energy', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '2', 'Mood', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '3', 'Cramps', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '4', 'Memory', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '5', 'Focus', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '6', 'Calm', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '7', 'Inflamation', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '8', 'Hair Growth', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '9', 'Immune System', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '10', 'Brain Health', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '11', 'Bone Health', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '12', 'Acne', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '13', 'Healthy Hair', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '14', 'Healthy Skin', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '15', 'PMS', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '16', 'Heart Health', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '17', 'Eye Health', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '18', 'Natural Sun Protection', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '19', 'Eczema', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '20', 'Psoriasis', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '21', 'Metabolism', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '22', 'Cholesterol', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '23', 'Migrains', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '24', 'Nerve Health', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '25', 'Dementia', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '26', 'Depression', '2020-10-05 19:17:10'), \
      ('2020-10-05 19:17:10', '27', 'Alzheimer`s', '2020-10-05 19:17:10'); ");
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('benefits', null, {});
  },
};