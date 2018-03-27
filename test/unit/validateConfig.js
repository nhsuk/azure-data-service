const chai = require('chai');
const validateConfig = require('../../lib/validateConfig');

const expect = chai.expect;
const validConfig = {
  log: { info: () => { } },
  outputFile: 'output-file',
  outputDir: './output/dir',
  summaryFile: 'mySummary',
  version: '0.1',
};

describe('validate AzureDataService config', () => {
  it('should not throw error for validConfig', () => {
    validateConfig(validConfig);
  });

  describe('validate log', () => {
    it('should throw error for missing log', () => {
      const config = { ...validConfig };
      delete config.log;
      expect(() => validateConfig(config)).to.throw('log is not defined, or does not have an \'info\' method');
    });

    it('should throw error for log with no info function', () => {
      const config = { ...validConfig };
      config.log = {};
      expect(() => validateConfig(config)).to.throw('log is not defined, or does not have an \'info\' method');
    });
  });

  describe('output file', () => {
    it('should throw error for missing output file', () => {
      const config = { ...validConfig };
      delete config.outputFile;
      expect(() => validateConfig(config)).to.throw('outputFile \'undefined\' is not defined, or contains illegal characters');
    });

    it('should throw error for output file with path characters', () => {
      const config = { ...validConfig };
      config.outputFile = '../../passwords';
      expect(() => validateConfig(config)).to.throw(`outputFile '${config.outputFile}' is not defined, or contains illegal characters`);
    });
  });

  describe('output dir', () => {
    it('should throw error for missing output dir', () => {
      const config = { ...validConfig };
      delete config.outputDir;
      expect(() => validateConfig(config)).to.throw('outputDir \'undefined\' is not defined, or contains illegal characters');
    });

    it('should throw error for absolute path', () => {
      const config = { ...validConfig };
      config.outputDir = '/etc';
      expect(() => validateConfig(config)).to.throw(`outputDir '${config.outputDir}' is not defined, or contains illegal characters`);
    });

    it('should throw error for path containing parent path', () => {
      const config = { ...validConfig };
      config.outputDir = './output/../../etc';
      expect(() => validateConfig(config)).to.throw(`outputDir '${config.outputDir}' is not defined, or contains illegal characters`);
    });
  });

  describe('version', () => {
    it('should throw error for missing version', () => {
      const config = { ...validConfig };
      delete config.version;
      expect(() => validateConfig(config)).to.throw('version \'undefined\' is not defined, or contains illegal characters');
    });

    it('should throw error for invalid version', () => {
      const config = { ...validConfig };
      config.version = 'onepoint2';
      expect(() => validateConfig(config)).to.throw(`version '${config.version}' is not defined, or contains illegal characters`);
    });
  });
});
