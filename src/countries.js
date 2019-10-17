/* @flow strict */
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

export type CountryDefinition = {|
  name: string,
  official_name: string,
  alpha2: string,
  alpha3: string,
  numeric: number,
  flag: string,
|};

export type AllCountries = { [string]: CountryDefinition };

async function loadCountries(dir: string): Promise<AllCountries> {
  // $FlowFixMe flow does not understands fs.opendir() yet.
  const countries: Array<{ name: string }> = await fs.opendir(dir);
  const returnValue: AllCountries = {};

  for (const entry of countries) {
    const yamlPath = path.join(dir, entry.name);
    const yamlDataBuffer = await fs.readFile(yamlPath);
    const yamlData = yamlDataBuffer.toString('utf8');
    const doc = (((yaml.safeLoad(yamlData)): any): CountryDefinition);
    returnValue[doc.alpha3] = doc;
  }

  return returnValue;
}

module.exports = loadCountries;
