module.exports = {
  // need for user sign up.
  up: async (queryInterface, Sequelize) => {
    const themes = await queryInterface.rawSelect('path_themes', {}, ['id']);
    if (themes) return 'success';
    return queryInterface.bulkInsert('path_themes', [
      {
        id: 1,
        name: 'desert',
        header_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/headerImgPath/desert.png',
        footer_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/footerImgPath/desert.png',
      },
      {
        id: 2,
        name: 'beach',
        header_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/headerImgPath/beach.png',
        footer_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/footerImgPath/beach.png',
        button_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/buttonImgPath/beach.png',
      },
      {
        id: 3,
        name: 'mountains',
        header_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/headerImgPath/mountains.png',
        footer_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/footerImgPath/mountains.png',
        button_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/buttonImgPath/mountains.png',
      },
      {
        id: 4,
        name: 'campsite',
        header_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/headerImgPath/campsite.png',
        footer_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/footerImgPath/campsite.png',
        button_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/buttonImgPath/campsite.png',
      },
      {
        id: 5,
        name: 'city',
        header_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/headerImgPath/city.png',
        footer_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/footerImgPath/city.png',
        button_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/buttonImgPath/city.png',
      },
      {
        id: 6,
        name: 'forest',
        header_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/headerImgPath/forest.png',
        footer_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/footerImgPath/forest.png',
        button_img_path:
          'https://foodfriendapp.s3.us-east-2.amazonaws.com/paths/buttonImgPath/forest.png',
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('path_themes', null, {});
  },
};
