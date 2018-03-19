const chai = require('chai');
const log = require('../../lib/logger');

const AzureDataService = require('../../AzureDataService');

const expect = chai.expect;
const timeout = 15000;

const version = '0.7';
const outputDir = './test/output';
const filename = 'dev-pharmacy-data';
const summaryFilename = 'summary';
const azureDataService = new AzureDataService({
  filename,
  log,
  outputDir,
  summaryFilename,
  version,
});

describe('Azure Data Service', function azureDataServiceTest() {
  this.timeout(timeout);
  describe('download functions', () => {
    it('should get latest data', async () => {
      const { data, date } = await azureDataService.getLatestData();
      expect(data).to.exist;
      expect(date).to.exist;
    });
  });
});
