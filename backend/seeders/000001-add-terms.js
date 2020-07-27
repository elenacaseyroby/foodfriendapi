module.exports = {
  // need for user sign up.
  up: async (queryInterface, Sequelize) => {
    const terms = await queryInterface.rawSelect('terms_and_conditions', {}, [
      'id',
    ]);
    if (terms) return 'success';
    return queryInterface.bulkInsert('terms_and_conditions', [
      {
        text:
          'FoodFriend does not represent expert advice and should never be used as a substitute for direct medical advice. If you are experiencing a health issue, we ask that you reach out to a healthcare professional. Additionally, we encourage you to explore how the introduction of new foods and nutrients into your diet might impact your health with your doctor or other qualified healthcare provider. FoodFriend cannot be held responsible for any health problems resulting from consuming foods or nutrients mentioned in our product. \
        \
        Security is important to us. You are responsible for choosing effective passwords and maintaining the confidentiality of your account. \
        \
        Each FoodFriend account can only be used by one user. By allowing anyone else to use your account, you forgo the rights to the remainder of your subscription. If any person that is not you has used your account, the account may be subject to suspension or deletion regardless of time remaining on the subscription and regardless of if the subscription is paid. \
        \
        All art you see on our app or website is the intellectual property of FoodFriend, LLC and cannot be used without permission.',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('terms_and_conditions', null, {});
  },
};
