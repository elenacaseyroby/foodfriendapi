'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('terms_and_conditions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date_published: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      text: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('terms_and_conditions');
  },
};
