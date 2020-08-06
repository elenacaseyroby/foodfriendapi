'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('path_themes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      header_img_path: {
        type: Sequelize.STRING(150),
      },
      footer_img_path: {
        type: Sequelize.STRING(150),
      },
      button_img_path: {
        type: Sequelize.STRING(150),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('path_themes');
  },
};
