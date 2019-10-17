/* @flow strict */
require('dotenv').config();
const path = require('path');
const express = require('express');
const getCountries = require('./countries');
const { format: formatDate } = require('date-fns');

import type { AllCountries, CountryDefinition } from './countries';

type ExpressRequest = {
  _parsedUrl: {
    pathname: string,
  },
};
type ExpressResponse = {
  status: (number) => ExpressResponse,
  header: (string, string | number) => void,
  json: (Object | Array<mixed> | string | number | null) => void,
  send: (string) => void,
};

const DATA_ROOT: string = process.env.DATA_PATH || path.join(__dirname, '..', 'data');
const PORT: string | number = process.env.PORT || 3000;

function gmtTimestamp(): string {
  const NOW = new Date();
  const TIME_GMT = NOW.getTime() + NOW.getTimezoneOffset() * 60 * 1000;

  return formatDate(TIME_GMT, "EEE, dd MMM yyyy HH:mm:ss 'GMT'");
}
const LAST_MODIFIED = gmtTimestamp();

function countrySort(a: CountryDefinition, b: CountryDefinition): number {
  try {
    return a.name.localeCompare(b.name);
  } catch(e) {
    console.error('cannot compare');
    console.error(a);
    console.error(b);

    return 0;
  }
}

function hashString(data: string): number {
  let hash = 0, i, chr;
  if (data.length === 0) return hash;
  for (i = 0; i < data.length; i++) {
    chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash = 0xffff & hash; // Convert to 32bit integer
  }

  return hash;
}

async function runServer(countries: AllCountries, port) {
  const app = express();
  const allCountries: Array<CountryDefinition> = Object.keys(countries)
    .map((key: string) => countries[key])
    .sort(countrySort);

  const eTagAll = hashString(JSON.stringify(allCountries));
  const eTags: { [string]: number } = {};
  allCountries.forEach(country => {
    eTags[country.alpha3] = hashString(JSON.stringify(country));
  });

  app.get('/[a-zA-Z]{2}', (req: ExpressRequest, res: ExpressResponse) => {
    const alpha2: string = req._parsedUrl.pathname.substr(1).toLowerCase();
    const country = allCountries.find(c => c.alpha2 === alpha2);

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.header('etag', eTags[country.alpha3]);
    res.header('last-modified', LAST_MODIFIED);
    res.json(country);
  });

  app.get('/[a-zA-Z]{3}', (req: ExpressRequest, res: ExpressResponse) => {
    const alpha3: string = req._parsedUrl.pathname.substr(1).toLowerCase();
    const country = countries[alpha3];

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.header('etag', eTags[country.alpha3]);
    res.header('last-modified', LAST_MODIFIED);
    res.json(country);
  });

  app.get('/[0-9]{1,3}', (req: ExpressRequest, res: ExpressResponse) => {
    const numberCode: number = parseInt(req._parsedUrl.pathname.substr(1), 10);
    const country = allCountries.find(c => c.numeric === numberCode);

    if (!country) {
      return res.status(404).send('country not found');
    }

    res.header('etag', eTags[country.alpha3]);
    res.header('last-modified', LAST_MODIFIED);
    res.json(country);
  });

  app.get('/', (req: ExpressRequest, res: ExpressResponse) => {
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
