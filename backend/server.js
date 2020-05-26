import express from 'express';
import Sequelize from 'sequelize';
import dotenv from 'dotenv';

const app = express();
const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
dotenv.config();

//make connection w db:
let sequelize;
sequelize = new Sequelize(process.env[config.use_env_variable]);
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
