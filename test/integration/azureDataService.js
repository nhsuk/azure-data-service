const chai = require('chai');
const moment = require('moment');

const AzureDataService = require('../../AzureDataService');

const expect = chai.expect;
const timeout = 15000;

const version = '0.1';
const outputDir = './test/output';
const outputFile = 'test-data';
const summaryFilename = 'summary';
const seedIdFile = 'test-seed-ids';
const containerName = 'data-test';
const stubbedLog = { info: () => { } };

const azureDataService = new AzureDataService({
  containerName,
  outputFile,
  log: stubbedLog,
  outputDir,
  seedIdFile,
  summaryFilename,
  version,
});

const timeOfEtl = moment('20180319');

describe('Azure Data Service', function azureDataServiceTest() {
  this.timeout(timeout);
  describe('upload functions', () => {
    it('should upload data', async () => {
      await azureDataService.uploadData(timeOfEtl);
    });

    it('should upload summary', async () => {
      await azureDataService.uploadSummary(timeOfEtl);
    });

    it('should upload ids', async () => {
      await azureDataService.uploadIds(`${outputDir}/cache-ids.json`, timeOfEtl);
    });
  });

  describe('download functions', () => {
    it('should get latest data', async () => {
      const { data, date } = await azureDataService.getLatestData();
      expect(data).to.exist;
      expect(date).to.exist;
    });

    it('should get latest ids', async () => {
      const { data, date } = await azureDataService.getLatestIds();
      expect(data).to.exist;
      expect(date).to.exist;
    });
  });
});
