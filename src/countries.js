/* @flow */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function loadCountries(dir) {
  const countries = await fs.promises.opendir(dir);
  const returnValue = {};

  for await (const entry of countries) {
    // console.log(entry);
    const yamlPath = path.join(dir, entry.name);
    const yamlData = await fs.promises.readFile(yamlPath);
    const doc = yaml.safeLoad(yamlData);
    returnValue[doc.alpha3] = doc;
  }

  return returnValue;
}

module.exports = loadCountries;
