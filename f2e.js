const persian = require('./lib/persianjs');

module.exports = function f2eConvertor(fNumber) {
  return fNumber ? parseInt(persian(fNumber).toEnglishNumber().toString()) : null;
};
