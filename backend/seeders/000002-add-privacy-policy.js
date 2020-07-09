module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('privacy_policy', [
      {
        text: 'Placeholder privacy policy text.',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('privacy_policy', null, {});
  },
};
