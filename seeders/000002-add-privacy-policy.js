module.exports = {
  // need for user sign up.
  up: async (queryInterface, Sequelize) => {
    const policies = await queryInterface.rawSelect('privacy_policies', {}, [
      'id',
    ]);
    if (policies) return 'success';
    return queryInterface.bulkInsert('privacy_policies', [
      {
        text: 'Placeholder privacy policy text.',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('privacy_policies', null, {});
  },
};
