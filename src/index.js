/* @flow */
const path = require('path');
const getCountries = require('./countries');

const DATA_ROOT = path.join(__dirname, '..', 'data');

const message: string = 'Hello World!';

async function main() {
  console.log(message);
  const data = await getCountries(DATA_ROOT);
  console.log(data);
}

main();
