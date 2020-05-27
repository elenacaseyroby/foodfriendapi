'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('path_nutrients', {
      path_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'paths', key: 'id' },
      },
      nutrient_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'nutrients', key: 'id' },
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
    return queryInterface.dropTable('path_nutrients');
  },
};
