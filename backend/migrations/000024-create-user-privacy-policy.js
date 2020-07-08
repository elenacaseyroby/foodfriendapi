'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('user_privacy_policies', {
        user_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
        },
        policy_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'privacy_policy', key: 'id' },
        },
        date_accepted: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      })
      .then(() => {
        return queryInterface.sequelize.query(
          'ALTER TABLE `user_privacy_policies` ADD UNIQUE `unique_index`(`user_id`, `policy_id`);'
        );
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_privacy_policies');
  },
};
