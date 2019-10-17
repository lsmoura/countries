/* @flow */
require('dotenv').config();
const path = require('path');
const express = require('express');
const getCountries = require('./countries');
const { format: formatDate } = require('date-fns');

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

function gmtTimestamp(): string {
  const NOW = new Date();
  const TIME_GMT = NOW.getTime() + NOW.getTimezoneOffset() * 60 * 1000;

  return formatDate(TIME_GMT, "EEE, dd MMM yyyy HH:mm:ss 'GMT'");
}
const LAST_MODIFIED = gmtTimestamp();

function countrySort(a, b) {
  try {
    return a.name.localeCompare(b.name);
  } catch(e) {
    console.error('cannot compare');
    console.error(a);
    console.error(b);

    return 0;
  }
}

function hashString(data: string): string {
  let hash = 0, i, chr;
  if (data.length === 0) return hash;
  for (i = 0; i < data.length; i++) {
    chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash = 0xffff & hash; // Convert to 32bit integer
  }

  return hash;
}

async function runServer(countries, port) {
  const app = express();
  const allCountries: Array<countryDefinition> = Object.keys(countries)
    .map(key => countries[key])
    .sort(countrySort);

  const eTagAll = hashString(JSON.stringify(allCountries));
  const eTags = {};
  allCountries.forEach(country => {
    eTags[country.alpha3] = hashString(JSON.stringify(country));
  });

  app.get('/[a-zA-Z]{2}', (req, res) => {
    const alpha2: string = req._parsedUrl.pathname.substr(1).toLowerCase();
    const country = allCountries.find(c => c.alpha2 === alpha2);

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.header('etag', eTags[country.alpha3]);
    res.header('last-modified', LAST_MODIFIED);
    res.json(country);
  });

  app.get('/[a-zA-Z]{3}', (req, res) => {
    const alpha3: string = req._parsedUrl.pathname.substr(1).toLowerCase();
    const country = countries[alpha3];

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.header('etag', eTags[country.alpha3]);
    res.header('last-modified', LAST_MODIFIED);
    res.json(country);
  });

  app.get('/[0-9]{1,3}', (req, res) => {
    const numberCode: string = parseInt(req._parsedUrl.pathname.substr(1), 10);
    const country = allCountries.find(c => c.numeric === numberCode);

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.header('etag', eTags[country.alpha3]);
    res.header('last-modified', LAST_MODIFIED);
    res.json(country);
  });

  app.get('/', (req, res) => {
    res.header('etag', eTagAll);
    res.header('last-modified', LAST_MODIFIED);
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
