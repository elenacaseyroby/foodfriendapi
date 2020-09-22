'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('recipes', 'user_report_is_verified', {
      allowNull: true,
      default: false,
      type: Sequelize.BOOLEAN,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('recipes', 'user_report_is_verified');
  },
};
