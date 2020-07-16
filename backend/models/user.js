'use strict';
import { differenceOfTwoArrays } from '../utils/common';
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
      foreignKey: 'activePathId',
      targetKey: 'id',
    });
    User.belongsToMany(models.Diet, {
      through: 'UserDiet',
      foreignKey: 'userId',
      otherKey: 'dietId',
    });
    User.belongsToMany(models.Recipe, {
      through: 'UserRecipe',
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
  User.prototype.getApiVersion = async function () {
    // This will return a version of the user instance
    // that excludes an properties in the
    // propertiesToHide array defined below.
    const propertiesToHide = ['salt', 'password'];
    let apiUserInstance = {};
    for (const property in this.dataValues) {
      if (!propertiesToHide.includes(property)) {
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
    try {
      let dietsAdded;
      let dietsRemoved;
      // Add diets.
      if (dietIdsToAdd.length > 0) {
        const dietsToAdd = updatedDiets.map((diet) => {
          if (dietIdsToAdd.includes(diet.id)) {
            return diet;
          }
        });
        console.log(`dietsToAdd : ${dietsToAdd}`);
        // Based on number of diets to add,
        // choose appropriate method:
        if (dietsToAdd.length === 1) {
          console.log('ADD ONE DIET');
          dietsAdded = await this.addDiet(dietsToAdd);
          console.log('ADDED ONE DIET');
        }
        if (dietsToAdd.length > 1) {
          console.log('ADD MULTIPLE DIETS');
          dietsAdded = await this.addDiets(dietsToAdd);
          console.log('ADDED MULTIPLE DIETS');
        }
      }
      // Remove diets.
      if (dietIdsToRemove.length > 0) {
        const dietsToRemove = userDiets.map((diet) => {
          if (dietIdsToRemove.includes(diet.id)) {
            return diet;
          }
        });
        console.log(`dietsToRemove : ${dietsToAdd}`);
        // Based on number of diets to remove,
        // choose appropriate method:
        if (dietsToRemove.length === 1) {
          dietsRemoved = await this.removeDiet(dietsToRemove);
        }
        if (dietsToRemove.length > 1) {
          dietsRemoved = await this.removeDiets(dietsToRemove);
        }
      }
      console.log(`diets added ${dietsAdded}`);
      console.log(`diets removed: ${dietsRemoved}`);
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
