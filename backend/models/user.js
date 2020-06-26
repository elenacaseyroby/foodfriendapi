'use strict';
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      first_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      last_name: {
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
      password_reset_token: {
        type: DataTypes.STRING,
      },
      password_reset_expiration_time: {
        type: DataTypes.DATE,
      },
      birthday: {
        type: DataTypes.DATE,
      },
      is_vegan: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      menstruates: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
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
    console.log(`${this.id} - ${salt} - ${hashedPassword}`);
    return User.update(
      {
        salt: salt,
        password: hashedPassword,
      },
      {
        where: {
          id: this.id,
        },
      }
    );
  };
  User.prototype.validatePassword = function (password) {
    return this.password === hashPassword(password, this.salt);
  };
  User.prototype.generatePasswordResetToken = function () {
    this.password_reset_token = crypto.randomBytes(20).toString('hex');
    this.password_reset_expiration_time = Date.now() + 3600000; //expires in an hour
    // might break here if save() doesn't work
    this.save();
  };
  User.prototype.validatePasswordReset = function (token) {
    return (
      this.password_reset_token === token &&
      Date.now() < this.password_reset_expiration_time
    );
  };

  return User;
};

function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 100, 'sha512')
    .toString('hex');
}
