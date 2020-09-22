'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('recipes', 'reported_by_user', {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: { model: 'users', key: 'id' },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipes', 'reported_by_user');
  },
};
