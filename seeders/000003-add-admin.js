module.exports = {
  // need for onboarding survey
  up: async (queryInterface, Sequelize) => {
    // Only create admin if does not yet exist.
    const admin = await queryInterface.rawSelect(
      'users',
      {
        where: {
          email: 'admin@foodfriend.io',
        },
      },
      ['id']
    );
    if (admin) return 'success';
    return queryInterface.bulkInsert('users', [
      {
        email: 'admin@foodfriend.io',
        first_name: 'Admin',
        last_name: 'Admin',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
