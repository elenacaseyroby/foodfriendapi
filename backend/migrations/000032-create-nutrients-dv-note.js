'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('nutrients', 'dv_note', {
      type: Sequelize.STRING(15),
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('nutrients', 'dv_note');
  },
};
