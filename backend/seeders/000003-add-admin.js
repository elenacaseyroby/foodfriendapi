module.exports = {
  // need for onboarding survey
  up: async (queryInterface, Sequelize) => {
    const user1 = await queryInterface.rawSelect(
      'users',
      {
        where: {
          id: 1,
        },
      },
      ['id']
    );
    if (user1) return 'success';
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
