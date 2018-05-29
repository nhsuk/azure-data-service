const chai = require('chai');
const createFileVersionFilter = require('../../lib/filters').createFileVersionFilter;

const expect = chai.expect;

describe('create filter', () => {
  it('should match file for version and name', () => {
    const files = [
      { name: 'shoe-data-20180220-0.1.json' },
      { name: 'shis-data-20180220-0.1.json' },
      { name: 'shia-data-20180220-0.1.json' },
    ];
    const filter = createFileVersionFilter('shis-data', '0.1');
    const result = files.find(filter);
    expect(result.name).to.be.equal('shis-data-20180220-0.1.json');
  });

  it('should select data file, not summary file', () => {
    const files = [
      { name: 'shoe-data-20180220-0.1.json' },
      { name: 'shis-data-summary-20180220-0.1.json' },
      { name: 'shis-data-20180220-0.1.json' },
      { name: 'shia-data-20180220-0.1.json' },
    ];
    const filter = createFileVersionFilter('shis-data', '0.1');
    const result = files.find(filter);
    expect(result.name).to.be.equal('shis-data-20180220-0.1.json');
  });

  it('should select data file, not file with prefix', () => {
    const files = [
      { name: 'shoe-data-20180220-0.1.json' },
      { name: 'dev-shis-data-20180220-0.1.json' },
      { name: 'shis-data-20180220-0.1.json' },
      { name: 'shia-data-20180220-0.1.json' },
    ];
    const filter = createFileVersionFilter('shis-data', '0.1');
    const result = files.find(filter);
    expect(result.name).to.be.equal('shis-data-20180220-0.1.json');
  });
});
