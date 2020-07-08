'use strict';
const crypto = require('crypto');
var sequelizeNoUpdateAttributes = require('sequelize-noupdate-attributes');

module.exports = (sequelize, DataTypes) => {
  sequelizeNoUpdateAttributes(sequelize);
  const TermsAndConditions = sequelize.define(
    'TermsAndConditions',
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
      tableName: 'terms_and_conditions',
      underscored: true,
      timestamps: false,
    }
  );
  TermsAndConditions.associate = function (models) {
    TermsAndConditions.belongsToMany(models.Recipe, {
      through: 'UserTermsAndConditions',
      as: 'users',
      foreignKey: 'termsId',
      otherKey: 'userId',
    });
  };
  return TermsAndConditions;
};
