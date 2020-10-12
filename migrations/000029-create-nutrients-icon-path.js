'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('nutrients', 'icon_path', {
      type: Sequelize.STRING(150),
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('nutrients', 'icon_path');
  },
};
