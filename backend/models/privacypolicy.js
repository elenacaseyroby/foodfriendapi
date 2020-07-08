'use strict';
const crypto = require('crypto');
var sequelizeNoUpdateAttributes = require('sequelize-noupdate-attributes');

module.exports = (sequelize, DataTypes) => {
  sequelizeNoUpdateAttributes(sequelize);
  const PrivacyPolicy = sequelize.define(
    'PrivacyPolicy',
    {
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
      tableName: 'privacy_policy',
      underscored: true,
      timestamps: false,
    }
  );
  PrivacyPolicy.associate = function (models) {
    PrivacyPolicy.belongsToMany(models.Recipe, {
      through: 'UserPrivacyPolicies',
      as: 'users',
      foreignKey: 'policyId',
      otherKey: 'userId',
    });
  };
  return PrivacyPolicy;
};
