'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('nutrient_foods', {
      nutrient_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'nutrients', key: 'id' },
      },
      food_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'foods', key: 'id' },
      },
      percent_dv_per_serving: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
      },
      source: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('nutrient_foods');
  },
};
