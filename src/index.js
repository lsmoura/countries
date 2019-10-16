/* @flow */
require('dotenv').config();
const path = require('path');
const express = require('express');
const getCountries = require('./countries');

type countryDefinition = {|
  name: string,
  official_name: string,
  alpha2: string,
  alpha3: string,
  numeric: number,
  flag: string,
|};

const DATA_ROOT: string = process.env.DATA_PATH || path.join(__dirname, '..', 'data');
const PORT: string | number = process.env.PORT || 3000;

const message: string = 'Hello World!';

async function runServer(countries, port) {
  const app = express();
  const allCountries: Array<countryDefinition> = Object.keys(countries)
    .map(key => countries[key])
    .sort((a, b) => a.name.localeCompare(b.name));

  app.get('/[a-zA-Z]{2}', (req, res) => {
    const alpha2: string = req._parsedUrl.pathname.substr(1).toLowerCase();
    const country = allCountries.find(c => c.alpha2 === alpha2);

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.json(country);
  });

  app.get('/[a-zA-Z]{3}', (req, res) => {
    const alpha3: string = req._parsedUrl.pathname.substr(1).toLowerCase();
    const country = countries[alpha3];

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.json(country);
  });

  app.get('/[0-9]{1,3}', (req, res) => {
    const numberCode: string = parseInt(req._parsedUrl.pathname.substr(1), 10);
    const country = allCountries.find(c => c.numeric === numberCode);

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.json(country);
  });

  app.get('/', (req, res) => {
    res.json(allCountries);
  });

  app.listen(port, () => {
    console.log(`server running at ${port}`);
  });

  return app;
}

async function main() {
  const data = await getCountries(DATA_ROOT);

  const app = runServer(data, PORT);
}

main();
