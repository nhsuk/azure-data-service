const fileRegex = /^[0-9a-zA-Z_.@()-]+$/;
const pathRegex = /^[^/][0-9a-zA-Z_./@()-]+$/;
const versionRegex = /^[0-9.]+$/;

function validateLog(config) {
  if (!config.log || typeof config.log.info !== 'function') {
    throw new Error('log is not defined, or does not have an \'info\' method');
  }
}

function validateFilename(filename, fieldName) {
  if (!(filename && fileRegex.test(filename))) {
    throw new Error(`${fieldName} '${filename}' is not defined, or contains illegal characters`);
  }
}

function validateOutputFile(config) {
  validateFilename(config.outputFile, 'outputFile');
}

function validateOutputDir(config) {
  if (!(config.outputDir && pathRegex.test(config.outputDir) && config.outputDir.indexOf('../') < 0)) {
    throw new Error(`outputDir '${config.outputDir}' is not defined, or contains illegal characters`);
  }
}

function validateSummaryFile(config) {
  validateFilename(config.summaryFilename, 'summaryFile');
}

function validateVersion(config) {
  if (!(config.version && versionRegex.test(config.version))) {
    throw new Error(`version '${config.version}' is not defined, or contains illegal characters`);
  }
}

function validateConfig(config) {
  validateLog(config);
  validateOutputFile(config);
  validateOutputDir(config);
  validateSummaryFile(config);
  validateVersion(config);
}

module.exports = validateConfig;
