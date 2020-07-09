module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('terms_and_conditions', [
      {
        text: 'Placeholder terms and conditions text.',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terms_and_conditions', null, {});
  },
};
