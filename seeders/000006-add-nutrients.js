module.exports = {
  // need for path page
  up: async (queryInterface, Sequelize) => {
    const nutrient = await queryInterface.rawSelect('nutrients', {}, ['name']);
    if (nutrient) return 'success';
    return queryInterface.sequelize.query(
      " \
      INSERT INTO `nutrients` (`id`, `name`, `dv_in_mg`, `dv_source`, `description`, `description_sources`, `warnings`, `warnings_sources`, `source_note`, `created_at`, `updated_at`, `theme_id`, `icon_path`, `dv_note`) VALUES \
('1', 'Thiamine', '1.200000', 'https://www.mayoclinic.org/drugs-supplements-thiamin/art-20366430', 'Thiamin helps the body generate energy from nutrients... heating foods containing thiamin can reduce thiamin content. People who have had bariatric surgery, have conditions such as HIV/AIDS, are chronic alcoholics, or use drugs such as the diuretic furosemide (Lasix), are at risk of a thiamin deficiency. Wernicke-Korsakoffs syndrome or beriberi, a condition that involves peripheral nerve damage.*', 'https://www.mayoclinic.org/drugs-supplements-thiamin/art-20366430', '', '', 'Quoted from the Mayo Clinic', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 2, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/thiamine.png', '1.2 mg'), \
('2', 'Vitamin A', '0.900000', 'https://ods.od.nih.gov/factsheets/VitaminA-Consumer/', 'Vitamin A is a fat-soluble vitamin that is naturally present in many foods. Vitamin A is important for normal vision, the immune system, and reproduction. Vitamin A also helps the heart, lungs, kidneys, and other organs work properly.*', 'https://ods.od.nih.gov/factsheets/VitaminA-Consumer/', 'High intakes of some forms of vitamin A can be harmful.\r\n\r\nGetting too much preformed vitamin A (usually from supplements or certain medicines) can cause dizziness, nausea, headaches, coma, and even death. High intakes of preformed vitamin A in pregnant women can also cause birth defects in their babies. Women who might be pregnant should not take high doses of vitamin A supplements.*', 'https://ods.od.nih.gov/factsheets/VitaminA-Consumer/', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 3, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/vitamin-a.png', '900 mcg'), \
('3', 'B12', '0.002400', 'https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/', 'Vitamin B12 is a nutrient that helps keep the body’s nerve and blood cells healthy and helps make DNA, the genetic material in all cells. Vitamin B12 also helps prevent a type of anemia called megaloblastic anemia that makes people tired and weak.*', 'https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/', 'B12 can be difficult to get as a vegetarian or vegan, since its found in micro-organisms. However, depending upon the micro-organisms in the cultivation process, fermented foods and algae can be a good source of B12. One study showed that that a test group of Koreans got approximately 31 percent of their vitamin B-12 from kimchi, fermented soy products and seaweed. But be careful sourcing your veggie B12; many algaes, like spirulina, contain B12 analogues that test as B12 without any of the health effects of B12. ', 'study: \"Fermented Food & B-12\" by Jessica Bruso published in the SF Gate 2018, vegan b12 info: https://www.b12-vitamin.com/algae/', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 1, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/b12.png', '2.4 mcg'), \
('4', 'B6', '1.700000', 'https://ods.od.nih.gov/factsheets/VitaminB6-Consumer/', 'Vitamin B6 is a vitamin that is naturally present in many foods. The body needs vitamin B6 for more than 100 enzyme reactions involved in metabolism. Vitamin B6 is also involved in brain development during pregnancy and infancy as well as immune function.*', 'https://ods.od.nih.gov/factsheets/VitaminB6-Consumer/', 'People almost never get too much vitamin B6 from food. But taking high levels of vitamin B6 from supplements for a year or longer can cause severe nerve damage, leading people to lose control of their bodily movements. The symptoms usually stop when they stop taking the supplements. Other symptoms of too much vitamin B6 include painful, unsightly skin patches, extreme sensitivity to sunlight, nausea, and heartburn.*', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 4, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/vitamin-b6.png', '1.7 mg'),  \
('5', 'Vitamin D', '0.020000', 'https://ods.od.nih.gov/factsheets/VitaminD-Consumer/', 'Vitamin D is a nutrient found in some foods that is needed for health and to maintain strong bones. It does so by helping the body absorb calcium (one of bone’s main building blocks) from food and supplements. People who get too little vitamin D may develop soft, thin, and brittle bones, a condition known as rickets in children and osteomalacia in adults.  Vitamin D is important to the body in many other ways as well. Muscles need it to move, for example, nerves need it to carry messages between the brain and every body part, and the immune system needs vitamin D to fight off invading bacteria and viruses. Together with calcium, vitamin D also helps protect older adults from osteoporosis.*', 'https://ods.od.nih.gov/factsheets/VitaminD-Consumer/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 5, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/vitamin-d.png', '20 mcg'), \
('6', 'Vitamin E', '15.000000', 'https://ods.od.nih.gov/factsheets/VitaminE-Consumer/', 'Vitamin E is a fat-soluble nutrient found in many foods. In the body, it acts as an antioxidant, helping to protect cells from the damage caused by free radicals. Free radicals are compounds formed when our bodies convert the food we eat into energy. People are also exposed to free radicals in the environment from cigarette smoke, air pollution, and ultraviolet light from the sun.  The body also needs vitamin E to boost its immune system so that it can fight off invading bacteria and viruses. It helps to widen blood vessels and keep blood from clotting within them. In addition, cells use vitamin E to interact with each other and to carry out many important functions.*', 'https://ods.od.nih.gov/factsheets/VitaminE-Consumer/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 4, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/vitamin-e.png', '15 mg'), \
('7', 'Biotin', '0.030000', 'https://ods.od.nih.gov/factsheets/Biotin-Consumer/', 'Biotin is a B-vitamin found in many foods. Biotin helps turn the carbohydrates, fats, and proteins in the food you eat into the energy you need.*', 'https://ods.od.nih.gov/factsheets/Biotin-Consumer/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 5, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/biotin.png', '30 mcg'), \
('8', 'Vitamin C', '90.000000', 'https://ods.od.nih.gov/factsheets/VitaminC-Consumer/', 'Vitamin C, also known as ascorbic acid, is a water-soluble nutrient found in some foods. In the body, it acts as an antioxidant, helping to protect cells from the damage caused by free radicals. Free radicals are compounds formed when our bodies convert the food we eat into energy. People are also exposed to free radicals in the environment from cigarette smoke, air pollution, and ultraviolet light from the sun.  The body also needs vitamin C to make collagen, a protein required to help wounds heal. In addition, vitamin C improves the absorption of iron from plant-based foods and helps the immune system work properly to protect the body from disease.*', 'https://ods.od.nih.gov/factsheets/VitaminC-Consumer/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 3, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/vitamin-c.png', '90 mg'), \
('9', 'Zinc', '11.000000', 'https://ods.od.nih.gov/factsheets/Zinc-Consumer/', 'Zinc is a nutrient that people need to stay healthy. Zinc is found in cells throughout the body. It helps the immune system fight off invading bacteria and viruses. The body also needs zinc to make proteins and DNA, the genetic material in all cells. During pregnancy, infancy, and childhood, the body needs zinc to grow and develop properly. Zinc also helps wounds heal and is important for proper senses of taste and smell.*', 'https://ods.od.nih.gov/factsheets/Zinc-Consumer/', 'Yes, if you get too much. Signs of too much zinc include nausea, vomiting, loss of appetite, stomach cramps, diarrhea, and headaches. When people take too much zinc for a long time, they sometimes have problems such as low copper levels, lower immunity, and low levels of HDL cholesterol (the “good” cholesterol).*', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 4, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/zinc.png', '11mg'), \
('10', 'Niacin', '16.000000', 'https://ods.od.nih.gov/factsheets/Niacin-Consumer/', 'Niacin (also called vitamin B3) helps turn the food you eat into the energy you need. Niacin is important for the development and function of the cells in your body.*', 'https://ods.od.nih.gov/factsheets/Niacin-Consumer/', 'The niacin that food naturally contains is safe. However, dietary supplements with 30 mg or more of nicotinic acid can make the skin on your face, arms, and chest turn red and burn, tingle, and itch. These symptoms can also lead to headaches, rashes, and dizziness.*', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 5, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/niacin.png', '16mg'), \
('11', 'Riboflavin', '1.300000', 'https://ods.od.nih.gov/factsheets/Riboflavin-HealthProfessional/', 'Riboflavin (also called vitamin B2) is important for the growth, development, and function of the cells in your body. It also helps turn the food you eat into the energy you need.*', 'https://ods.od.nih.gov/factsheets/Riboflavin-HealthProfessional/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 2, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/riboflavin.png', '1.3 mg'), \
('12', 'Iron', '18.000000', 'https://ods.od.nih.gov/factsheets/Iron-Consumer/', 'Iron is a mineral that the body needs for growth and development. Your body uses iron to make hemoglobin, a protein in red blood cells that carries oxygen from the lungs to all parts of the body, and myoglobin, a protein that provides oxygen to muscles. Your body also needs iron to make some hormones.*', 'https://ods.od.nih.gov/factsheets/Iron-Consumer/', '[Iron] can be harmful if you get too much. In healthy people, taking high doses of iron supplements (especially on an empty stomach) can cause an upset stomach, constipation, nausea, abdominal pain, vomiting, and fainting. High doses of iron can also decrease zinc absorption. Extremely high doses of iron (in the hundreds or thousands of mg) can cause organ failure, coma, convulsions, and death. Child-proof packaging and warning labels on iron supplements have greatly reduced the number of accidental iron poisonings in children.  Some people have an inherited condition called hemochromatosis that causes toxic levels of iron to build up in their bodies. Without medical treatment, people with hereditary hemochromatosis can develop serious problems such as liver cirrhosis, liver cancer, and heart disease. People with this disorder should avoid using iron supplements and vitamin C supplements.*', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 3, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/iron.png', '18 mg'), \
('13', 'Magnesium', '420.000000', 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/', 'Magnesium is a nutrient that the body needs to stay healthy. Magnesium is important for many processes in the body, including regulating muscle and nerve function, blood sugar levels, and blood pressure and making protein, bone, and DNA.*', 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 2, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/magnesium.png', '420 mg'), \
('14', 'Calcium', '1300.000000', 'https://ods.od.nih.gov/factsheets/Calcium-Consumer/', 'Calcium is a mineral found in many foods. The body needs calcium to maintain strong bones and to carry out many important functions. Almost all calcium is stored in bones and teeth, where it supports their structure and hardness.  The body also needs calcium for muscles to move and for nerves to carry messages between the brain and every body part. In addition, calcium is used to help blood vessels move blood throughout the body and to help release hormones and enzymes that affect almost every function in the human body.*', 'https://ods.od.nih.gov/factsheets/Calcium-Consumer/', 'Getting too much calcium can cause constipation. It might also interfere with the body’s ability to absorb iron and zinc, but this effect is not well established. In adults, too much calcium (from dietary supplements but not food) might increase the risk of kidney stones. Some studies show that people who consume high amounts of calcium might have increased risks of prostate cancer and heart disease, but more research is needed to understand these possible links.*', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-07-07 19:14:46', 1, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/calcium.png', '1300 mg'), \
('15', 'Omega-3', '1600.000000', 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/', 'ALA is an essential fatty acid, meaning that your body can’t make it, so you must get it from the foods and beverages you consume. Your body can convert some ALA into EPA and then to DHA, but only in very small amounts. Therefore, getting EPA and DHA from foods (and dietary supplements if you take them) is the only practical way to increase levels of these omega-3 fatty acids in your body.  Omega-3s are important components of the membranes that surround each cell in your body. DHA levels are especially high in retina (eye), brain, and sperm cells. Omega-3s also provide calories to give your body energy and have many functions in your heart, blood vessels, lungs, immune system, and endocrine system (the network of hormone-producing glands).*', 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/', '', '', 'Quoted from the National Institutes Of Health Office of Dietary Supplements', '2020-06-09 22:22:16', '2020-06-09 22:22:16', 1, 'https://foodfriendapp.s3.us-east-2.amazonaws.com/nutrients/iconPath/omega-3.png', '1600 mg'); \
   "
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('paths', null, {});
  },
};