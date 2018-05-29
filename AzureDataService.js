const requireEnv = require('require-environment-variables');

requireEnv(['AZURE_STORAGE_CONNECTION_STRING']);

const azureService = require('./lib/azureService');
const filters = require('./lib/filters');
const fsHelper = require('./lib/fsHelper');
const getDateFromFilename = require('./lib/getDateFromFilename');
const validateConfig = require('./lib/validateConfig');

class AzureDataService {
  constructor(config) {
    this.log = config.log;
    this.containerName = config.containerName;
    this.outputFile = config.outputFile;
    this.outputDir = config.outputDir;
    this.localFile = `${this.outputDir}/${this.outputFile}.json`;
    this.summaryFile = config.summaryFile || 'summary';
    this.localSummaryFile = `${this.outputDir}/${this.summaryFile}.json`;
    this.seedIdFile = `${config.outputFile}-seed-ids`;
    this.localSeedIdFile = `${this.outputDir}/${this.seedIdFile}.json`;
    this.version = config.version;
    validateConfig(this);
  }

  // eslint-disable-next-line class-methods-use-this
  getSuffix(startMoment) {
    return `-${startMoment.format('YYYYMMDD')}.json`;
  }

  getSuffixWithVersion(startMoment) {
    return `-${startMoment.format('YYYYMMDD')}-${this.version}.json`;
  }

  async downloadLatest(blobName, filename) {
    this.log.info(`Latest version of ${filename} file identified as '${blobName}'`);
    await azureService.downloadFromAzure(this.containerName, filename, blobName);
    this.log.info(`Remote file '${blobName}' downloaded locally as '${filename}'`);
    const data = fsHelper.loadJsonSync(filename);
    const date = getDateFromFilename(blobName);
    return { data, date };
  }

  async getLatestIds() {
    const filter = b => b.name.startsWith(`${this.seedIdFile}-`);
    const blob = await azureService.getLatestBlob(this.containerName, filter);
    if (blob) {
      return this.downloadLatest(blob.name, this.localSeedIdFile);
    }
    throw Error('unable to retrieve ID list');
  }

  async getLatestData() {
    const filter = filters.createFileVersionFilter(this.outputFile, this.version);
    const lastScan = await azureService.getLatestBlob(this.containerName, filter);
    if (lastScan) {
      return this.downloadLatest(lastScan.name, this.localFile);
    }
    this.log.info(`unable to retrieve data, no data available for release ${this.version}?`);
    return { data: [] };
  }

  async uploadData(startMoment) {
    this.log.info(`Overwriting '${this.outputFile}.json' in Azure`);
    await azureService.uploadToAzure(this.containerName, this.localFile, `${this.outputFile}.json`);
    this.log.info(`Saving date stamped version of '${this.outputFile}' in Azure`);
    await azureService.uploadToAzure(this.containerName, this.localFile, `${this.outputFile}${this.getSuffixWithVersion(startMoment)}`);
  }

  async uploadIds(startMoment) {
    this.log.info(`Saving date stamped version of '${this.seedIdFile}' in Azure`);
    await azureService.uploadToAzure(this.containerName, this.localSeedIdFile, `${this.seedIdFile}${this.getSuffix(startMoment)}`);
  }

  async uploadSummary(startMoment) {
    this.log.info('Saving summary file in Azure');
    await azureService.uploadToAzure(this.containerName, this.localSummaryFile, `${this.outputFile}-${this.summaryFile}${this.getSuffixWithVersion(startMoment)}`);
  }

  async pruneDataFiles(oldestMoment, files) {
    const filter = filters.createExpiredDataFilter(this.outputFile, this.version, oldestMoment);
    const fileVersionFilter = filters.createFileVersionFilter(this.outputFile, this.version);
    await this.pruneExpiredFiles(files, filter, fileVersionFilter);
  }

  async pruneIdListFiles(oldestMoment, files) {
    const filter = filters.createExpiredIdListFilter(this.outputFile, this.version, oldestMoment);
    const latestFilter = filters.createIdListFilter(this.seedIdFile);
    await this.pruneExpiredFiles(files, filter, latestFilter);
  }

  async pruneSummaryFiles(oldestMoment, files) {
    const filter = filters.createExpiredSummaryFilter(
      this.outputFile,
      this.summaryFile,
      this.version, oldestMoment
    );
    const latestFilter = filters.createSummaryFileFilter(this.outputFile, this.summaryFile);
    await this.pruneExpiredFiles(files, filter, latestFilter);
  }

  async pruneExpiredFiles(files, filter, latestFilter) {
    const expiredFiles = files.filter(filter);

    const latest = await azureService.getLatestBlob(this.containerName, latestFilter);
    // eslint-disable-next-line no-restricted-syntax
    for (const file of expiredFiles) {
      // safeguard to stop deleting latest data
      if (!latest || file.name !== latest.name) {
        // eslint-disable-next-line no-await-in-loop
        await azureService.deleteFromAzure(this.containerName, file.name);
      }
    }
  }

  async pruneFilesOlderThan(oldestMoment) {
    const files = await azureService.listBlobs(this.containerName);
    if (files) {
      await this.pruneDataFiles(oldestMoment, files);
      await this.pruneIdListFiles(oldestMoment, files);
      await this.pruneSummaryFiles(oldestMoment, files);
    }
  }
}

module.exports = AzureDataService;
