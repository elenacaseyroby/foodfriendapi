'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('paths', 'theme_id', {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: 'path_themes', key: 'id' },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('paths', 'theme_id');
  },
};
