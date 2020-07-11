'use strict';
var sequelizeNoUpdateAttributes = require('sequelize-noupdate-attributes');

module.exports = (sequelize, DataTypes) => {
  sequelizeNoUpdateAttributes(sequelize);
  const UserTermsAndConditions = sequelize.define(
    'UserTermsAndConditions',
    {
      dateAccepted: {
        type: DataTypes.DATE,
        noUpdate: {
          readOnly: true,
        },
      },
    },
    {
      tableName: 'user_terms_and_conditions',
      underscored: true,
      timestamps: false,
    }
  );
  return UserTermsAndConditions;
};
