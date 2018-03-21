# Azure Data Service
> service to upload and retrieve latest files from azure storage

## Usage

Instantiated using `new AzureDataService(config)`, requires a config object with filename, log, outputDir, and version.

```
const version = '0.1';
const outputDir = './test/output';
const filename = 'test-data';
const summaryFilename = 'summary';

const azureDataService = new AzureDataService({
  filename,
  log,
  outputDir,
  seedIdFile,
  summaryFilename,
  version,
});
```
