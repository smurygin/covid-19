# COVID-19 Dataset

<img align="right" width="95" height="95" alt="logo" src="https://smurygin.github.io/covid19-ru/logo.svg">

This repository crawl and collect dataset which includes time series data tracking the number of people affected by COVID-19 in Russia by federal subjects, including:

- confirmed cases of Coronavirus infection
- the number of people who have died form it
- the number of people who have recovered from it

## Data

Data is in **JSON** format contain data from **12 March 2020** and updated daily from [стопкоронавирус.рф](https://xn--80aesfpebagmfblc0a.xn--p1ai/information/).

### Format

```json
{
  "RU-MOW": [
    {
      "name": "Москва",
      "code": "RU-MOW",
      "sick": 21,
      "healed": 0,
      "died": 0,
      "sick_incr": 21,
      "healed_incr": 0,
      "died_incr": 0,
      "date": "2020-03-12",
      "isolation": {
        "start_date": null,
        "document_href": null,
        "restrictions": []
      }
    }
  ]
}
```

- date `date: string`
- name of federal subject `name: string`
- code of federal subject `code: string`
- confirmed cases of Coronavirus infection
  - total `sick: number`
  - per day `sick_incr: number`
- the number of people who have died form it
  - total `died: number`
  - per day `died_incr: number`
- the number of people who have recovered from it
  - total `healed: number`
  - per day `healed_incr: number`
- restrictions imposed by the government `isolation`
  - last update `start_date: string`
  - link to regulatory document `document_href: string`
  - list of restrictions `restrictions: string[]`

### Usage

JSON with data is available [here](https://smurygin.github.io/covid19-ru/dataset.json)

---

MIT
