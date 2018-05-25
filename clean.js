const moment = require('moment');
const AzureDataService = require('./AzureDataService');

const stubbedLog = { info: () => { } };

async function run() {
  const azureDataService = new AzureDataService({
    containerName: 'etl-output',
    log: stubbedLog,
    outputDir: './output',
    outputFile: 'pharmacy-data',
    version: '0.8',
  });
  try {
    await azureDataService.pruneFilesOlderThan(moment());
  } catch (ex) {
    throw ex;
  }
}

async function wait() {
  await run();
}

wait();
