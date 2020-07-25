module.exports = {
  up: async (queryInterface, Sequelize) => {
    const terms = await queryInterface.rawSelect('terms_and_conditions', {}, [
      'id',
    ]);
    if (terms) return 'success';
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
