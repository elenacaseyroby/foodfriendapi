'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      first_name: {
        allowNull: false,
        type: Sequelize.STRING(70),
      },
      last_name: {
        allowNull: false,
        type: Sequelize.STRING(70),
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(150),
        unique: true,
      },
      birthday: {
        type: Sequelize.DATEONLY,
      },
      is_vegan: {
        defaultValue: 0,
        type: Sequelize.BOOLEAN,
      },
      menstruates: {
        defaultValue: 0,
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  },
};
