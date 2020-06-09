'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('user_recipes', {
        user_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
        },
        recipe_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'recipes', key: 'id' },
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
      })
      .then(() => {
        return queryInterface.sequelize.query(
          'ALTER TABLE `user_recipes` ADD UNIQUE `unique_index`(`user_id`, `recipe_id`);'
        );
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_recipes');
  },
};
