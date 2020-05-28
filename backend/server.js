import express from 'express';
import dotenv from 'dotenv';
import { db } from './models';

// Config environment variables so they are
// accessible through process.env
dotenv.config();

// Start app.
const app = express();

// Listen for api requests.
const port = process.env.PORT || process.env.PORT;
app.listen(port, () => console.log(`listening on port ${port}`));

// Define api endpoints.
app.get('/nutrients', (req, res) =>
  db.Nutrient.findAll({
    include: [
      {
        model: db.Food,
        through: {},
        as: 'foods',
      },
    ],
  }).then((result) => res.json(result))
);
