const chai = require('chai');
const AzureDataService = require('../../AzureDataService');

const expect = chai.expect;

describe('create AzureDataService', () => {
  it('should default summary file to \'summary\' if non-provided', () => {
    const config = {
      log: { info: () => { } },
      outputFile: 'output-file',
      outputDir: './output/dir',
      version: '0.1',
    };
    const service = new AzureDataService(config);
    expect(service.summaryFile).to.be.equal('summary');
  });

  it('should map config to class fields', () => {
    const config = {
      containerName: 'etl-test',
      log: { info: () => { } },
      outputFile: 'output-file',
      outputDir: './output/dir',
      summaryFile: 'mySummary',
      version: '0.1',
    };
    const service = new AzureDataService(config);
    expect(service.containerName).to.be.equal(config.containerName);
    expect(service.log).to.be.equal(config.log);
    expect(service.outputFile).to.be.equal(config.outputFile);
    expect(service.outputDir).to.be.equal(config.outputDir);
    expect(service.seedIdFile).to.be.equal(`${config.outputFile}-seed-ids`);
    expect(service.summaryFile).to.be.equal(config.summaryFile);
    expect(service.version).to.be.equal(config.version);
  });
});
