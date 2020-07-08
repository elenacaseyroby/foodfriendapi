'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      to_email: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      from_email: {
        allowNull: false,
        type: Sequelize.STRING(100),
        unique: true,
      },
      time_sent: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      subject: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      body: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('emails');
  },
};
