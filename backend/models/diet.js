'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diet = sequelize.define(
    'Diet',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
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
    },
    {
      tableName: 'diets',
      underscored: true,
      timestamps: false,
    }
  );
  Diet.associate = function (models) {
    Diet.belongsToMany(models.User, {
      through: 'UserDiet',
      as: 'users',
      foreignKey: 'diet_id',
      otherKey: 'user_id',
    });
  };
  return Diet;
};
