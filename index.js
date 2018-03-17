const cheerio = require('cheerio');
const axios = require('axios');
const persian = require('./persianjs');
const querystring = require('querystring');
const URL = 'http://www.time.ir';
const YEAR = 1397;
const fs = require('fs');

let arr = require('./data');
let promises = [];

function f2eConvertor(fNumber) {
  return fNumber ? parseInt(persian(fNumber).toEnglishNumber().toString()) : null;
}

function getHTML(year, month) {
  return axios.post(URL, querystring.stringify({
    'Year': year,
    'Month': month,
    'Base1': 0,
    'Base2': 1,
    'Base3': 2,
    'Responsive': true
  }));
};

function getEvents($, day) {
  const events = [];
  const eventsList = $('.list-unstyled')
    .find('li')
    .filter(function (i, ele) {
      return f2eConvertor($(this).find('span').first().text().split(' ')[0]) === day;
    });

  if (eventsList.length > 0) {
    eventsList.each(function (i, ele) {
      events.push($(this).find('span').empty().parent('li').text().trim());
    });
  }
  return events;
}


promises.push(getHTML(YEAR, 12)
  .then(data => {
    const $ = cheerio.load(data.data);
    return Promise.resolve($);
  })
  .then($ => {
    const monthName = $('span.selectMonth').text();
    arr.push({
      name: monthName,
      days: {},
    });
    monthIndex = arr.findIndex(month => month.name === monthName);

    $('.dayList>div').not('.disabled').find('.jalali').each(function (i, ele) {
      arr[monthIndex].days[i + 1] = getEvents($, i + 1);
    });
  }));

Promise.all(promises).then(() => {
  fs.writeFileSync('./data.json', JSON.stringify(arr), 'UTF-8');
});
