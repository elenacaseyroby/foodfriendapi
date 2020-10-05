'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'password_reset_token', {
      type: Sequelize.STRING(100),
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'password_reset_token');
  },
};
