const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
import Sequelize from 'sequelize';

//make connection w db:
const sequelize = new Sequelize('mysql://root:@localhost:3306/foodfriend');
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR BACKEND IS CONNECTED TO REACT!' });
});
