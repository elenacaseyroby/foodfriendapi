'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'active_path_id', {
      type: Sequelize.INTEGER,
      references: { model: 'paths', key: 'id' },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'active_path_id');
  },
};
