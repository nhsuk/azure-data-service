const azureService = require('./lib/azureService');
const fsHelper = require('./lib/fsHelper');
const createFilter = require('./lib/createFileVersionFilter');
const sortDateDesc = require('./lib/sortByFilenameDateDesc');
const getDateFromFilename = require('./lib/getDateFromFilename');

function getSuffix(startMoment) {
  return `-${startMoment.format('YYYYMMDD')}-${this.version}.json`;
}

class AzureDataService {
  constructor(config) {
    this.log = config.log;
    this.version = config.version;
    this.outputDir = config.outputDir;
    this.filename = config.filename;
    this.seedIdFile = config.seedIdFile;
    this.summaryFilename = config.summaryFilename;
    this.localFile = `${this.outputDir}/${this.filename}.json`;
  }

  async downloadLatest(blobName, filename) {
    this.log.info(`Latest version of ${filename} file identified as '${blobName}'`);
    await azureService.downloadFromAzure(filename, blobName);
    this.log.info(`Remote file '${blobName}' downloaded locally as: '${filename}'`);
    const data = fsHelper.loadJsonSync(filename);
    const date = getDateFromFilename(blobName);
    return { data, date };
  }
  async getLatestIds() {
    const filter = b => b.name.startsWith(`${this.seedIdFile}-`);
    const blob = await azureService.getLatestBlob(filter);
    if (blob) {
      return this.downloadLatest(blob.name, `${this.seedIdFile}.json`);
    }
    throw Error('unable to retrieve ID list');
  }

  async getLatestData() {
    const filter = createFilter(this.filename, this.version);
    const lastScan = await azureService.getLatestBlob(filter, sortDateDesc);
    if (lastScan) {
      return this.downloadLatest(lastScan.name, this.localFile);
    }
    this.log.info(`unable to retrieve data, no data available for release ${this.version}?`);
    return { data: [] };
  }

  async uploadData(startMoment) {
    this.log.info(`Overwriting '${this.filename}' in Azure`);
    await azureService.uploadToAzure(this.outputFile, this.localFile);
    this.log.info(`Saving date stamped version of '${this.outputFile}' in Azure`);
    await azureService.uploadToAzure(this.outputFile, `${this.outputDir}/${this.outputFile}${getSuffix(startMoment)}`);
  }

  async uploadSummary(startMoment) {
    this.log.info('Saving summary file in Azure');
    await azureService.uploadToAzure(this.summaryFile, `${this.outputDir}/${this.outputFile}-summary${getSuffix(startMoment)}`);
  }
}

module.exports = AzureDataService;
