'use strict';
const { differenceOfTwoArrays } = require('../utils/common');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING(70),
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING(70),
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(150),
      },
      password: {
        type: DataTypes.STRING(70),
      },
      salt: {
        type: DataTypes.STRING(100),
      },
      passwordResetToken: {
        type: DataTypes.STRING(100),
      },
      passwordResetExpirationTime: {
        type: DataTypes.DATE,
      },
      birthday: {
        type: DataTypes.DATEONLY,
      },
      isVegan: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      menstruates: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      dateLastActive: {
        type: DataTypes.DATE,
      },
      utcOffsetInHours: {
        type: DataTypes.INTEGER(5),
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
      foreignKey: 'activePathId',
      as: 'activePath',
      targetKey: 'id',
    });
    User.belongsToMany(models.Diet, {
      through: 'UserDiet',
      foreignKey: 'userId',
      otherKey: 'dietId',
    });
    User.belongsToMany(models.Food, {
      through: 'UserFood',
      foreignKey: 'userId',
      otherKey: 'foodId',
    });
    User.belongsToMany(models.Recipe, {
      through: 'UserRecipe',
      as: 'recipes',
      foreignKey: 'userId',
      otherKey: 'recipeId',
    });
    User.belongsToMany(models.TermsAndConditions, {
      through: 'UserTermsAndConditions',
      foreignKey: 'userId',
      otherKey: 'termsId',
    });
    User.belongsToMany(models.PrivacyPolicy, {
      through: 'UserPrivacyPolicies',
      foreignKey: 'userId',
      otherKey: 'policyId',
    });
  };
  // methods in alphabetical order:
  User.prototype.agreeToPrivacyPolicy = async function (policy) {
    // built in makes this getPolicys instead of getPolicies
    const alreadyAgreed = await this.hasAgreedToPrivacyPolicy(policy);
    if (alreadyAgreed) return 'success';
    const agreedPolicy = await this.addPrivacyPolicy(policy, {
      through: {},
    });
    if (agreedPolicy) return 'success';
    return;
  };
  User.prototype.agreeToTerms = async function (term) {
    const alreadyAgreed = await this.hasAgreedToTerms(term);
    if (alreadyAgreed) return 'success';
    const agreedTerms = await this.addTermsAndConditions(term, {
      through: {},
    });
    if (agreedTerms) return 'success';
    return;
  };
  User.prototype.generatePasswordResetToken = async function () {
    this.passwordResetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetExpirationTime = Date.now() + 3600000; //expires in an hour
    // might break here if save() doesn't work
    const saved = await this.save();
    return saved && this.passwordResetToken;
  };
  User.prototype.getApiVersion = async function (propertiesToHide = []) {
    // This will return a version of the user instance
    // that excludes an properties in the
    // allPropertiesToHide array defined below.
    const defaultPropertiesToHide = ['salt', 'password'];
    const allPropertiesToHide = defaultPropertiesToHide.concat(
      propertiesToHide
    );
    let apiUserInstance = {};
    for (const property in this.dataValues) {
      if (!allPropertiesToHide.includes(property)) {
        apiUserInstance[property] = this[property];
      }
    }
    return apiUserInstance;
  };
  User.prototype.setPassword = async function (password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hashPassword(password, salt);
    this.salt = salt;
    this.password = hashedPassword;
    const saved = await this.save();
    if (saved) return 'success';
    return;
  };
  User.prototype.update = async function (userUpdates) {
    // Input an object with the user properties you would like to change.
    // Output updatedUser onsuccess or undefined on failure.
    // Updates user if new values.
    for (const property in userUpdates) {
      if (this[property] !== userUpdates[property] && property !== 'password')
        this[property] = userUpdates[property];
    }
    if (userUpdates.password) {
      await this.setPassword(userUpdates.password);
    }
    const saved = await this.save();
    if (saved) return this;
    return;
  };
  User.prototype.updateDiets = async function (updatedDiets) {
    // input: the diets you would like the user to have,
    // output: 'success' on success and undefined on failure.

    // Convert userDiets and updatedDiets into arrays of ids:
    const userDiets = await this.getDiets();
    const userDietIdsList = await userDiets.map((diet) => {
      return diet.id;
    });
    const updatedDietIdsList = await updatedDiets.map((diet) => {
      return diet.id;
    });

    // Compare the arrays to find ids to add and ids to delete
    const dietIdsToAdd = await differenceOfTwoArrays(
      updatedDietIdsList,
      userDietIdsList
    );
    const dietIdsToRemove = await differenceOfTwoArrays(
      userDietIdsList,
      updatedDietIdsList
    );
    // if arrays to add and delete are empty, our job is done.
    if (!dietIdsToAdd && !dietIdsToRemove) return 'success';

    // Get diet objects to add.
    let dietsToAdd = [];
    updatedDiets.map((diet) => {
      if (dietIdsToAdd.includes(diet.id)) {
        dietsToAdd.push(diet);
      }
    });
    // Get diet objects to remove.
    let dietsToRemove = [];
    userDiets.map((diet) => {
      if (dietIdsToRemove.includes(diet.id)) {
        dietsToRemove.push(diet);
      }
    });
    console.log(`diets to add: ${dietIdsToAdd}`);
    console.log(`diets to remove: ${dietsToRemove}`);
    try {
      let dietsAdded;
      let dietsRemoved;
      // Add diets.
      if (dietsToAdd) {
        // Based on number of diets to add,
        // choose appropriate method:
        if (dietsToAdd.length === 1) {
          dietsAdded = await this.addDiet(dietsToAdd);
        }
        if (dietsToAdd.length > 1) {
          dietsAdded = await this.addDiets(dietsToAdd);
        }
      }
      // Remove diets.
      if (dietsToRemove) {
        // Based on number of diets to remove,
        // choose appropriate method:
        if (dietsToRemove.length === 1) {
          dietsRemoved = await this.removeDiet(dietsToRemove);
        }
        if (dietsToRemove.length > 1) {
          dietsRemoved = await this.removeDiets(dietsToRemove);
        }
      }
      console.log(`diets added ${JSON.stringify(dietsAdded)}`);
      console.log(`diets removed: ${JSON.stringify(dietsRemoved)}`);
      return 'success';
    } catch (error) {
      console.log(error);
      return;
    }
  };
  User.prototype.validatePassword = function (password) {
    return this.password === hashPassword(password, this.salt);
  };
  User.prototype.validatePasswordResetToken = function (token) {
    return (
      this.passwordResetToken === token &&
      Date.now() < this.passwordResetExpirationTime
    );
  };
  // technically methods but should be properties:
  User.prototype.hasAgreedToTerms = async function (term) {
    const userTermIds = await this.getTermsAndConditions().map((term) => {
      return term.id;
    });
    return userTermIds.includes(term.id);
  };
  User.prototype.hasAgreedToPrivacyPolicy = async function (policy) {
    const userPolicyIds = await this.getPrivacyPolicies().map((policy) => {
      return policy.id;
    });
    return userPolicyIds.includes(policy.id);
  };
  return User;
};
function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 100, 'sha512')
    .toString('hex');
}
