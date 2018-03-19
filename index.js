const cheerio = require('cheerio');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const whily = require('whily').while;
const f2e = require('./f2e');

const URL = 'http://www.time.ir';
const YEAR = 1397;
let arr = [];

const monthsOrder = {
  'فروردین': 1,
  'اردیبهشت': 2,
  'خرداد': 3,
  'تیر': 4,
  'مرداد': 5,
  'شهریور': 6,
  'مهر': 7,
  'آبان': 8,
  'آذر': 9,
  'دی': 10,
  'بهمن': 11,
  'اسفند': 12
};

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
      return f2e($(this).find('span').first().text().split(' ')[0]) === day;
    });

  if (eventsList.length > 0) {
    eventsList.each(function (i, ele) {
      events.push($(this).find('span').empty().parent('li').text().trim());
    });
  }
  return events;
};

function getMonthData(month) {
  return getHTML(YEAR, month)
    .then((data) => {
      const $ = cheerio.load(data.data);
      return Promise.resolve($);
    })
    .then(($) => {
      const monthName = $('span.selectMonth').text();
      arr.push({
        name: monthName,
        days: {},
      });
      monthIndex = arr.findIndex(month => month.name === monthName);
      $('.dayList>div').not('.disabled').find('.jalali').each(function (i, ele) {
        arr[monthIndex].days[i + 1] = getEvents($, i + 1);
      });
    });
};

let index = 0;
whily(() => {
  index += 2;
  return (index <= 12);
}, () => {
  return Promise.all([getMonthData(index - 1), getMonthData(index)]);
})
  .then(() => {
    arr.sort((a, b) => monthsOrder[a.name] - monthsOrder[b.name]);
    return Promise.resolve();
  })
  .then(() => {
    fs.writeFileSync('./data.json', JSON.stringify(arr), 'UTF-8');
  });
