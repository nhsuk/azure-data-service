const azureService = require('./lib/azureService');
const fsHelper = require('./lib/fsHelper');
const createFilter = require('./lib/createFileVersionFilter');
const sortDateDesc = require('./lib/sortByFilenameDateDesc');
const getDateFromFilename = require('./lib/getDateFromFilename');

class AzureDataService {
  constructor(config) {
    if (config.log && config.version && config.outputDir
      && config.outputFile && config.containerName) {
      this.log = config.log;
      this.containerName = config.containerName;
      this.outputFile = config.outputFile;
      this.outputDir = config.outputDir;
      this.localFile = `${this.outputDir}/${this.outputFile}.json`;
      this.summaryFilename = 'summary' || config.summaryFilename;
      this.localSummaryFile = `${this.outputDir}/${this.summaryFilename}.json`;
      this.seedIdFile = config.seedIdFile;
      this.version = config.version;
    } else {
      throw new Error('require log, version, outputDir and outputFile set');
    }
  }

  getSuffix(startMoment) {
    return `-${startMoment.format('YYYYMMDD')}-${this.version}.json`;
  }

  async downloadLatest(blobName, filename) {
    this.log.info(`Latest version of ${filename} file identified as '${blobName}'`);
    await azureService.downloadFromAzure(this.containerName, filename, blobName);
    this.log.info(`Remote file '${blobName}' downloaded locally as: '${filename}'`);
    const data = fsHelper.loadJsonSync(filename);
    const date = getDateFromFilename(blobName);
    return { data, date };
  }
  async getLatestIds() {
    const filter = b => b.name.startsWith(`${this.seedIdFile}-`);
    const blob = await azureService.getLatestBlob(this.containerName, filter);
    if (blob) {
      return this.downloadLatest(blob.name, `${this.outputDir}/${this.seedIdFile}.json`);
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
    await azureService.uploadToAzure(this.containerName, this.localFile, `${this.outputFile}${this.getSuffix(startMoment)}`);
  }

  async uploadIds(localIdFile, startMoment) {
    this.log.info(`Saving date stamped version of '${this.seedIdFile}' in Azure`);
    await azureService.uploadToAzure(this.containerName, localIdFile, `${this.seedIdFile}${this.getSuffix(startMoment)}`);
  }

  async uploadSummary(startMoment) {
    this.log.info('Saving summary file in Azure');
    await azureService.uploadToAzure(this.containerName, this.localSummaryFile, `${this.outputFile}-${this.summaryFilename}${this.getSuffix(startMoment)}`);
  }
}

module.exports = AzureDataService;
