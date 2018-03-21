const azureService = require('./lib/azureService');
const fsHelper = require('./lib/fsHelper');
const createFilter = require('./lib/createFileVersionFilter');
const sortDateDesc = require('./lib/sortByFilenameDateDesc');
const getDateFromFilename = require('./lib/getDateFromFilename');

class AzureDataService {
  constructor(config) {
    if (config.log && config.version && config.outputDir && config.filename) {
      this.log = config.log;
      this.version = config.version;
      this.outputDir = config.outputDir;
      this.filename = config.filename;
      this.seedIdFile = config.seedIdFile;
      this.summaryFilename = 'summary' || config.summaryFilename;
      this.localFile = `${this.outputDir}/${this.filename}.json`;
      this.localSummaryFile = `${this.outputDir}/${this.summaryFilename}.json`;
    } else {
      throw new Error('require log, version, outputDir and filename set');
    }
  }

  getSuffix(startMoment) {
    return `-${startMoment.format('YYYYMMDD')}-${this.version}.json`;
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
      return this.downloadLatest(blob.name, `${this.outputDir}/${this.seedIdFile}.json`);
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
    await azureService.uploadToAzure(this.localFile, this.filename);
    this.log.info(`Saving date stamped version of '${this.filename}' in Azure`);
    await azureService.uploadToAzure(this.localFile, `${this.filename}${this.getSuffix(startMoment)}`);
  }

  async uploadIds(localIdFile, startMoment) {
    this.log.info(`Saving date stamped version of '${this.seedIdFile}' in Azure`);
    await azureService.uploadToAzure(localIdFile, `${this.seedIdFile}${this.getSuffix(startMoment)}`);
  }

  async uploadSummary(startMoment) {
    this.log.info('Saving summary file in Azure');
    await azureService.uploadToAzure(this.localSummaryFile, `${this.filename}-${this.summaryFilename}${this.getSuffix(startMoment)}`);
  }
}

module.exports = AzureDataService;
