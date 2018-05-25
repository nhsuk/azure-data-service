const chai = require('chai');
const moment = require('moment');
const createFilter = require('../../lib/filters').createExpiredDataFilter;

const expect = chai.expect;

describe('create createExpiredFileFilter', () => {
  it('should return filenames earlier than provided oldest date', () => {
    const oldestDate = moment('2018-05-08');
    const expired1 = 'test-data-20180319-0.1.json';
    const expired2 = 'test-data-20180501-0.1.json';
    const files = [
      { name: expired1 },
      { name: expired2 },
      { name: 'test-data-20180508-0.1.json' },
      { name: 'test-data-20180515-0.1.json' },
    ];

    const filter = createFilter('test-data', '0.1', oldestDate);
    const result = files.filter(filter);
    expect(result.length).to.be.equal(2);
    expect(result[0].name).to.be.equal(expired1);
    expect(result[1].name).to.be.equal(expired2);
  });

  it('should return no files if all in date', () => {
    const oldestDate = moment('2018-05-08');
    const files = [
      { name: 'test-data-20180508-0.1.json' },
      { name: 'test-data-20180515-0.1.json' },
    ];

    const filter = createFilter('test-data', '0.1', oldestDate);
    const result = files.filter(filter);
    expect(result.length).to.be.equal(0);
  });

  it('should ignore non date files', () => {
    const oldestDate = moment('2018-05-15');
    const expiredFile = 'test-data-20180508-0.1.json';
    const files = [
      { name: 'test-data.json' },
      { name: expiredFile },
      { name: 'test-data-20180515-0.1.json' },
    ];

    const filter = createFilter('test-data', '0.1', oldestDate);
    const result = files.filter(filter);
    expect(result.length).to.equal(1);
    expect(result[0].name).to.equal(expiredFile);
  });
});
