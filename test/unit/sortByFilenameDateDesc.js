const chai = require('chai');
const sortByFilenameDateDesc = require('../../lib/sortByFilenameDateDesc');

const expect = chai.expect;

describe('sort by filename date in descending order', () => {
  it('should sort by date string in name', () => {
    const files = [
      { name: 'shis-data-20180220-0.1.json' },
      { name: 'shis-data-20180320-0.1.json' },
      { name: 'shis-data-20180120-0.1.json' },
    ];
    const result = files.sort(sortByFilenameDateDesc);
    expect(result[0].name).to.be.equal('shis-data-20180320-0.1.json');
    expect(result[1].name).to.be.equal('shis-data-20180220-0.1.json');
    expect(result[2].name).to.be.equal('shis-data-20180120-0.1.json');
  });

  it('should put files with no dates last', () => {
    const files = [
      { name: 'shis-data.json' },
      { name: 'shis-data-20180320-0.1.json' },
      { name: 'shis-data-20180120-0.1.json' },
    ];
    const result = files.sort(sortByFilenameDateDesc);
    expect(result[0].name).to.be.equal('shis-data-20180320-0.1.json');
    expect(result[1].name).to.be.equal('shis-data-20180120-0.1.json');
    expect(result[2].name).to.be.equal('shis-data.json');
  });

  it('should put files with badly formatted dates last', () => {
    const files = [
      { name: 'shis-data-20189999-0.1.json' },
      { name: 'shis-data-20180320-0.1.json' },
      { name: 'shis-data-20180120-0.1.json' },
    ];
    const result = files.sort(sortByFilenameDateDesc);
    expect(result[0].name).to.be.equal('shis-data-20180320-0.1.json');
    expect(result[1].name).to.be.equal('shis-data-20180120-0.1.json');
    expect(result[2].name).to.be.equal('shis-data-20189999-0.1.json');
  });
});
