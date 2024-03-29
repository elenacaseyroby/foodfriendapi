'use strict';
const crypto = require('crypto');
var sequelizeNoUpdateAttributes = require('sequelize-noupdate-attributes');

module.exports = (sequelize, DataTypes) => {
  sequelizeNoUpdateAttributes(sequelize);
  const PrivacyPolicy = sequelize.define(
    'PrivacyPolicy',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      text: {
        type: DataTypes.TEXT,
        noUpdate: {
          readOnly: true,
        },
      },
      datePublished: {
        type: DataTypes.DATE,
        noUpdate: {
          readOnly: true,
        },
      },
    },
    {
      tableName: 'privacy_policies',
      underscored: true,
      timestamps: false,
    }
  );
  PrivacyPolicy.associate = function (models) {
    PrivacyPolicy.belongsToMany(models.User, {
      through: 'UserPrivacyPolicies',
      as: 'users',
      foreignKey: 'policyId',
      otherKey: 'userId',
    });
  };
  return PrivacyPolicy;
};
