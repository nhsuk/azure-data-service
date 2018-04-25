const requireEnv = require('require-environment-variables');

requireEnv(['AZURE_STORAGE_CONNECTION_STRING']);

const azureService = require('./lib/azureService');
const createFilter = require('./lib/createFileVersionFilter');
const fsHelper = require('./lib/fsHelper');
const getDateFromFilename = require('./lib/getDateFromFilename');
const sortDateDesc = require('./lib/sortByFilenameDateDesc');
const validateConfig = require('./lib/validateConfig');

function getSuffix(startMoment) {
  return `-${startMoment.format('YYYYMMDD')}.json`;
}

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
    const filter = createFilter(this.outputFile, this.version);
    const lastScan = await azureService.getLatestBlob(this.containerName, filter, sortDateDesc);
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
    await azureService.uploadToAzure(this.containerName, this.localSeedIdFile, `${this.seedIdFile}${getSuffix(startMoment)}`);
  }

  async uploadSummary(startMoment) {
    this.log.info('Saving summary file in Azure');
    await azureService.uploadToAzure(this.containerName, this.localSummaryFile, `${this.outputFile}-${this.summaryFile}${this.getSuffixWithVersion(startMoment)}`);
  }
}

module.exports = AzureDataService;
