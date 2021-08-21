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
const DATASET_PATH = '../docs/dataset.json';
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

function mapData(origin) {
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

async function getCommonData() {
  const dataset = require(DATASET_PATH);
  const page = await axios.get(SOURCE_URL);

  console.log('🟢 the data has been received');

  const data = cheerio.load(page.data)('cv-spread-overview').attr(':spread-data');
  const cases = JSON.parse(data);

  cases.forEach((city) => {
    const lastInDataset = dataset[city.code][dataset[city.code].length - 1];
    const todayInDataset = dayjs(lastInDataset.date, DATE_FORMAT).isToday();

    if (!todayInDataset) {
      dataset[city.code].push(mapData(city));
    } else if (
      city.sick !== lastInDataset.sick ||
      city.died !== lastInDataset.died ||
      city.healed !== lastInDataset.healed ||
      city.sick_incr !== lastInDataset.sick_incr ||
      city.healed_incr !== lastInDataset.healed_incr ||
      city.died_incr !== lastInDataset.died_incr ||
      city.isolation.start_date === lastInDataset.isolation.date
    ) {
      dataset[city.code][dataset[city.code].length - 1] = mapData(city);
    }
  });

  console.log('🟢 the data has been proceed');

  await write(
    require.resolve(DATASET_PATH),
    prettier.format(JSON.stringify(dataset), { printWidth: 120, parser: 'json' })
  );

  console.log('🟢 the dataset has been updated');
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
