'use strict';
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      salt: {
        type: DataTypes.STRING,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
      },
      passwordResetExpirationTime: {
        type: DataTypes.DATE,
      },
      birthday: {
        type: DataTypes.DATE,
      },
      isVegan: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      menstruates: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: false,
    }
  );
  User.associate = function (models) {
    User.belongsTo(models.Path, {
      foreignKey: 'active_path_id',
      targetKey: 'id',
    });
    User.belongsToMany(models.Diet, {
      through: 'UserDiet',
      as: 'diets',
      foreignKey: 'user_id',
      otherKey: 'diet_id',
    });
    User.belongsToMany(models.Recipe, {
      through: 'UserRecipe',
      as: 'recipes',
      foreignKey: 'user_id',
      otherKey: 'recipe_id',
    });
  };
  // methods:
  User.prototype.setPassword = async function (password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hashPassword(password, salt);
    this.salt = salt;
    this.password = hashedPassword;
    const saved = await this.save();
    if (saved) return 'success';
    return;
  };
  User.prototype.validatePassword = function (password) {
    return this.password === hashPassword(password, this.salt);
  };
  User.prototype.generatePasswordResetToken = function () {
    this.passwordResetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetExpirationTime = Date.now() + 3600000; //expires in an hour
    // might break here if save() doesn't work
    this.save();
    return this.passwordResetToken;
  };
  User.prototype.validatePasswordResetToken = function (token) {
    return (
      this.passwordResetToken === token &&
      Date.now() < this.passwordResetExpirationTime
    );
  };

  return User;
};

function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 100, 'sha512')
    .toString('hex');
}
