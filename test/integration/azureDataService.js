const chai = require('chai');
const moment = require('moment');

const AzureDataService = require('../../AzureDataService');
const azureService = require('../../lib/azureService');
const filters = require('../../lib/filters');

const expect = chai.expect;
const timeout = 15000;

const version = '0.1';
const outputDir = './test/output';
const outputFile = 'test-data';
const containerName = 'data-test';
const stubbedLog = { info: () => { } };

const azureDataService = new AzureDataService({
  containerName,
  outputFile,
  log: stubbedLog,
  outputDir,
  version,
});

const dateString = '20180319';
const timeOfEtl = moment(dateString);

describe('Azure Data Service', function azureDataServiceTest() {
  this.timeout(timeout);
  describe('summary functions', () => {
    it('should upload summary', async () => {
      await azureDataService.uploadSummary(timeOfEtl);
    });
  });

  describe('upload/download functions', () => {
    after(async function deleteGeneratedFile() {
      this.timeout(timeout);
      await azureService.deleteFromAzure(containerName, `${outputFile}-${dateString}-${version}.json`);
      await azureService.deleteFromAzure(containerName, `${outputFile}-seed-ids-${dateString}.json`);
      await azureService.deleteFromAzure(containerName, `${outputFile}-summary-${dateString}-${version}.json`);
    });

    it('should upload and download latest data', async () => {
      await azureDataService.uploadData(timeOfEtl);
      const { data, date } = await azureDataService.getLatestData();
      expect(data).to.exist;
      expect(date).to.exist;
    });

    it('should upload and download latest ids', async () => {
      await azureDataService.uploadIds(timeOfEtl);
      const { data, date } = await azureDataService.getLatestIds();
      expect(data).to.exist;
      expect(date).to.exist;
    });
  });

  function uploadOldDateStampedData(date, days) {
    return azureService.uploadToAzure(
      containerName,
      azureDataService.localFile,
      `${azureDataService.outputFile}${azureDataService.getSuffixWithVersion(moment(date).subtract(days, 'days'))}`
    );
  }
  function uploadOldDateStampedSummary(date, days) {
    return azureService.uploadToAzure(
      containerName,
      azureDataService.localFile,
      `${azureDataService.outputFile}-${azureDataService.summaryFile}${azureDataService.getSuffixWithVersion(moment(date).subtract(days, 'days'))}`
    );
  }

  function uploadOldDateStampedIdList(date, days) {
    return azureService.uploadToAzure(
      containerName,
      azureDataService.localSeedIdFile,
      `${azureDataService.seedIdFile}${azureDataService.getSuffix(moment(date).subtract(days, 'days'))}`
    );
  }

  describe('prune functions', () => {
    after(async function deleteGeneratedFile() {
      this.timeout(timeout);
      await azureService.deleteFromAzure(containerName, `${azureDataService.outputFile}-20180321-${version}.json`);
      await azureService.deleteFromAzure(containerName, `${azureDataService.outputFile}-${azureDataService.summaryFile}-20180321-${version}.json`);
      await azureService.deleteFromAzure(containerName, `${azureDataService.seedIdFile}-20180321.json`);
      await azureService.deleteFromAzure(containerName, `${azureDataService.outputFile}-20180314-${version}.json`);
      await azureService.deleteFromAzure(containerName, `${azureDataService.outputFile}-${azureDataService.summaryFile}-20180314-${version}.json`);
      await azureService.deleteFromAzure(containerName, `${azureDataService.seedIdFile}-20180314.json`);
    });

    it('should remove data files older than date', async () => {
      const date = '20180321';
      await uploadOldDateStampedData(date, 0);
      await uploadOldDateStampedData(date, 7);
      await uploadOldDateStampedData(date, 14);
      await uploadOldDateStampedData(date, 21);

      const oldestDate = moment(date).subtract(7, 'days');
      await azureDataService.pruneFilesOlderThan(oldestDate);
      const files = await azureService.listBlobs(containerName);
      const dataFilter = filters.createFileVersionFilter(azureDataService.outputFile, version);
      const dataFiles = files.filter(dataFilter);
      expect(dataFiles.length).to.equal(2);
    });

    it('should remove ID list files older than date', async () => {
      const date = '20180321';
      await uploadOldDateStampedIdList(date, 0);
      await uploadOldDateStampedIdList(date, 7);
      await uploadOldDateStampedIdList(date, 14);
      await uploadOldDateStampedIdList(date, 21);

      const oldestDate = moment(date).subtract(7, 'days');
      await azureDataService.pruneFilesOlderThan(oldestDate);
      const files = await azureService.listBlobs(containerName);
      const idFilter = filters.createIdListFilter(azureDataService.seedIdFile, version);
      const idFiles = files.filter(idFilter);
      expect(idFiles.length).to.equal(2);
    });

    it('should remove summary files older than date', async () => {
      const date = '20180321';
      await uploadOldDateStampedSummary(date, 0);
      await uploadOldDateStampedSummary(date, 7);
      await uploadOldDateStampedSummary(date, 14);
      await uploadOldDateStampedSummary(date, 21);

      const oldestDate = moment(date).subtract(7, 'days');
      await azureDataService.pruneFilesOlderThan(oldestDate);
      const files = await azureService.listBlobs(containerName);
      const summaryFilter = filters.createSummaryFileFilter(
        azureDataService.outputFile,
        azureDataService.summaryFile
      );
      const summaryFiles = files.filter(summaryFilter);
      expect(summaryFiles.length).to.equal(2);
    });

    it('should not remove latest file, even if before oldest date', async () => {
      const date = '20180321';
      await uploadOldDateStampedData(date, 0);
      await uploadOldDateStampedData(date, 7);

      const oldestDate = moment(date).add(7, 'days');
      await azureDataService.pruneFilesOlderThan(oldestDate);
      const files = await azureService.listBlobs(containerName);
      const dataFiles = files.filter(filters.createFileVersionFilter(outputFile, version));
      expect(dataFiles.length).to.equal(1);
    });

    it('should not remove latest ID file, even if before oldest date', async () => {
      const date = '20180321';
      await uploadOldDateStampedIdList(date, 0);
      await uploadOldDateStampedIdList(date, 7);

      const oldestDate = moment(date).add(7, 'days');
      await azureDataService.pruneFilesOlderThan(oldestDate);
      const files = await azureService.listBlobs(containerName);
      const idFilter = filters.createIdListFilter(azureDataService.seedIdFile);
      const idFiles = files.filter(idFilter);
      expect(idFiles.length).to.equal(1);
    });

    it('should not remove latest summary file, even if before oldest date', async () => {
      const date = '20180321';
      await uploadOldDateStampedSummary(date, 0);
      await uploadOldDateStampedSummary(date, 7);

      const oldestDate = moment(date).add(7, 'days');
      await azureDataService.pruneFilesOlderThan(oldestDate);
      const files = await azureService.listBlobs(containerName);
      const summaryFilter = filters.createSummaryFileFilter(
        azureDataService.outputFile,
        azureDataService.summaryFile
      );
      const summaryFiles = files.filter(summaryFilter);
      expect(summaryFiles.length).to.equal(1);
    });
  });
});
