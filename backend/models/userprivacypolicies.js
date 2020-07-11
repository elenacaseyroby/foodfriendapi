'use strict';
var sequelizeNoUpdateAttributes = require('sequelize-noupdate-attributes');

module.exports = (sequelize, DataTypes) => {
  sequelizeNoUpdateAttributes(sequelize);
  const UserPrivacyPolicies = sequelize.define(
    'UserPrivacyPolicies',
    {
      dateAccepted: {
        type: DataTypes.DATE,
        noUpdate: {
          readOnly: true,
        },
      },
    },
    {
      tableName: 'user_privacy_policies',
      underscored: true,
      timestamps: false,
    }
  );
  return UserPrivacyPolicies;
};
