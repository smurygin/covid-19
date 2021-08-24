# COVID-19 Dataset

<img align="right" width="95" height="95" alt="logo" src="https://smurygin.github.io/covid19-ru/logo.svg">

This repository crawl and collect dataset which includes time series data tracking the number of people affected by COVID-19 in Russia by federal subjects, including:

- confirmed cases of Coronavirus infection
- the number of people who have died form it
- the number of people who have recovered from it
- government restrictions

## Data

Data presented in the **JSON** format, collected starting from **March 12, 2020**, updated daily from [стопкоронавирус.рф](https://xn--80aesfpebagmfblc0a.xn--p1ai/information/).

### Format

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


### Example:

```json
{
  "RU-ROS": [
    {
      "name": "Ростовская область",
      "code": "RU-ROS",
      "sick": 121027,
      "healed": 105234,
      "died": 5799,
      "sick_incr": 483,
      "healed_incr": 289,
      "died_incr": 28,
      "date": "2021-08-24",
      "isolation": {
        "start_date": "19.08.2021 10:24:50",
        "restrictions": [
          "Введен масочно-перчаточный режим.",
          "Посещение заведений только с QR-кодом, ПЦР-тестом.",
          "Запрет на работу заведений общепита в ночное время.",
          "Фудкорты работают только на вынос.",
          "Все массовые мероприятия запрещены.",
          "Введен масочный режим и социальное дистанцирование в общественном транспорте.",
          "Закрыты бани и сауны, плавательные бассейны и аквапарки в закрытых помещениях, аттракционы в парках культуры и отдыха.",
          "Оказание государственных и муниципальных услуг осуществлять дистанционным способом либо при предъявлении получателем сертификата о вакцинации, сертификата о перенесенном заболевании, ПЦР.",
          "Введена обязательная вакцинация для   учреждений,  оказывающих услуги  по  санаторно-курортному  лечению,  организации  отдыха  и  оздоровления  детей, общественного  питания,  экскурсионного  обслуживания, сотрудников сферы транспорта."
        ],
        "document_href": "https://www.donland.ru/documents/14207/"
      }
    }
  ]
}
```


### Usage

JSON is available [here](https://smurygin.github.io/covid19-ru/dataset.json)

---

MIT
