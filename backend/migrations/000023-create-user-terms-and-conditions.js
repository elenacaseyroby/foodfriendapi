'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('user_terms_and_conditions', {
        user_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
        },
        terms_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'terms_and_conditions', key: 'id' },
        },
        date_accepted: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      })
      .then(() => {
        return queryInterface.sequelize.query(
          'ALTER TABLE `user_terms_and_conditions` ADD UNIQUE `unique_index`(`user_id`, `terms_id`);'
        );
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_terms_and_conditions');
  },
};
