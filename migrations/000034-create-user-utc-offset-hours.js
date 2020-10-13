'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'utc_offset_in_hours', {
      type: Sequelize.INTEGER(5),
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'utc_offset_in_hours');
  },
};
