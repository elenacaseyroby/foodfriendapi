module.exports = {
  up: async (queryInterface, Sequelize) => {
    const diet = await queryInterface.rawSelect('diets', {}, ['name']);
    if (diet) return 'success';
    return queryInterface.bulkInsert('diets', [
      {
        name: 'Vegan',
      },
      {
        name: 'Vegetarian',
      },
      {
        name: 'Gluten-free',
      },
      {
        name: 'Dairy-free',
      },
      {
        name: 'Pescatarian',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paths', null, {});
  },
};
