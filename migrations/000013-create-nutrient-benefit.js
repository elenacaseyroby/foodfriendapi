'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('nutrient_benefits', {
        nutrient_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'nutrients', key: 'id' },
        },
        benefit_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'benefits', key: 'id' },
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
          'ALTER TABLE `nutrient_benefits` ADD UNIQUE `unique_index`(`nutrient_id`, `benefit_id`);'
        );
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('nutrient_benefits');
  },
};
