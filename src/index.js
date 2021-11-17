const { promisify } = require('util');
const retry = require('async-retry');
const prettier = require('prettier');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const axios = require('axios');
const fs = require('fs');

const customParseFormatPlugin = require('dayjs/plugin/customParseFormat');
const isYesterdayPlugin = require('dayjs/plugin/isYesterday');
const isTodayPlugin = require('dayjs/plugin/isToday');
dayjs.extend(customParseFormatPlugin);
dayjs.extend(isYesterdayPlugin);
dayjs.extend(isTodayPlugin);

const SOURCE_URL = 'https://xn--80aesfpebagmfblc0a.xn--p1ai/information/';

const PATHS = {
  CASES_DATASET: '../docs/dataset.json',
  ROS_CASES_DATASET: '../docs/dataset-ros.json',
  VACCINATION_DATASET: '../docs/vac-dataset.json',
  ROS_VACCINATION_DATASET: '../docs/vac-dataset-ros.json',
};

const DATE_FORMAT = 'YYYY-MM-DD';

const write = promisify(fs.writeFile);

function processIsolation(isolation) {
  const $ = cheerio.load(isolation.descr);

  const restrictions = $('li:not(:has(a))')
    .toArray()
    .map((restriction) => $(restriction).text().trim());
  const document_href = $('li > a').attr('href');

  return {
    start_date: isolation.start_date,
    restrictions,
    document_href,
  };
}

function mapCasesData(origin) {
  return {
    name: origin.title,
    code: origin.code,
    sick: origin.sick,
    healed: origin.healed,
    died: origin.died,
    sick_incr: origin.sick_incr,
    healed_incr: origin.healed_incr,
    died_incr: origin.died_incr,
    date: dayjs(new Date()).format(DATE_FORMAT),
    isolation: origin.isolation
      ? processIsolation(origin.isolation)
      : {
          date: null,
          document_href: null,
          restrictions: [],
        },
  };
}

function mapVacData(origin) {
  return {
    date: dayjs(origin.covid_free_date).format(DATE_FORMAT),
    first_dose: origin.first,
    second_dose: origin.second,
    first_dose_incr: origin.first_incr,
    second_dose_incr: origin.second_incr,
    immune_percent: origin.immune_percent,
  };
}

async function getCommonData() {
  const casesDataset = require(PATHS.CASES_DATASET);
  const vacDataset = require(PATHS.VACCINATION_DATASET);

  const page = await axios.get(SOURCE_URL);

  console.log('🟢 the data has been received');

  const data = cheerio.load(page.data)('cv-spread-overview').attr(':spread-data');
  const cases = JSON.parse(data);

  cases.forEach((city) => {
    const lastInCasesDataset = casesDataset[city.code][casesDataset[city.code].length - 1];
    const todayInDataset = dayjs(lastInCasesDataset.date, DATE_FORMAT).isToday();

    if (!todayInDataset) {
      casesDataset[city.code].push(mapCasesData(city));
    } else if (
      city.sick !== lastInCasesDataset.sick ||
      city.died !== lastInCasesDataset.died ||
      city.healed !== lastInCasesDataset.healed ||
      city.sick_incr !== lastInCasesDataset.sick_incr ||
      city.healed_incr !== lastInCasesDataset.healed_incr ||
      city.died_incr !== lastInCasesDataset.died_incr ||
      city.isolation.start_date !== lastInCasesDataset.isolation.start_date
    ) {
      casesDataset[city.code][casesDataset[city.code].length - 1] = mapCasesData(city);
    }

    const lastInVacDataset = vacDataset[city.code][vacDataset[city.code].length - 1];

    if (lastInVacDataset.date !== dayjs(city.covid_free_date).format(DATE_FORMAT)) {
      vacDataset[city.code].push(mapVacData(city));
    } else if (
      lastInVacDataset.first_dose !== city.first ||
      lastInVacDataset.second_dose !== city.second ||
      lastInVacDataset.first_dose_incr !== city.first_incr ||
      lastInVacDataset.second_dose_incr !== city.second_incr ||
      lastInVacDataset.immune_percent !== city.immune_percent
    ) {
      vacDataset[city.code][vacDataset[city.code].length - 1] = mapVacData(city);
    }
  });

  console.log('🟢 the data has been proceed');

  await write(
    require.resolve(PATHS.CASES_DATASET),
    prettier.format(JSON.stringify(casesDataset), { printWidth: 120, parser: 'json' })
  );

  console.log('🟢 the cases dataset has been updated');

  await write(
    require.resolve(PATHS.ROS_CASES_DATASET),
    prettier.format(JSON.stringify(casesDataset['RU-ROS']), { printWidth: 120, parser: 'json' })
  );

  console.log('🟢 the rov cases dataset has been updated');

  await write(
    require.resolve(PATHS.VACCINATION_DATASET),
    prettier.format(JSON.stringify(vacDataset), { printWidth: 120, parser: 'json' })
  );

  console.log('🟢 the vac dataset has been updated');

  await write(
    require.resolve(PATHS.ROS_VACCINATION_DATASET),
    prettier.format(JSON.stringify(vacDataset['RU-ROS']), { printWidth: 120, parser: 'json' })
  );

  console.log('🟢 the rov vac dataset has been updated');
}

(async () => {
  try {
    await retry(async () => await getCommonData(), { retries: 5 });
  } catch (e) {
    console.log(`🔴 an error occurred while getting the data - ${JSON.stringify(e)}`);
    process.exit(1);
  }

  process.exit(0);
})();
