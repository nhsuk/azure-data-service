# Azure Data Service

[![GitHub Release](https://img.shields.io/github/release/nhsuk/azure-data-service.svg)](https://github.com/nhsuk/azure-data-service/releases/latest/)
[![npm version](https://badge.fury.io/js/azure-data-service.svg)](https://badge.fury.io/js/azure-data-service)
[![Greenkeeper badge](https://badges.greenkeeper.io/nhsuk/azure-data-service.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nhsuk/azure-data-service.svg?branch=master)](https://travis-ci.org/nhsuk/azure-data-service)
[![Coverage Status](https://coveralls.io/repos/github/nhsuk/azure-data-service/badge.svg?branch=master)](https://coveralls.io/github/nhsuk/azure-data-service?branch=master)

> service to upload and retrieve latest files from Azure Blob Storage

## Usage

The `azure-storage` package requires the environment variable `AZURE_STORAGE_CONNECTION_STRING` to be populated.

Instantiated using `new AzureDataService(config)`.

The config object requires `container`, `log`, `outputFile`, `outputDir`, and `version` populated.

The `summaryFile` defaults to `summary` if none is provided.
`seedIdFile` is only required if the `getLatestIds` and `uploadIds` functions are used.

Sample instantiation:
```
const version = '0.1';
const outputDir = './test/output';
const outputFile = 'test-data';
const summaryFilename = 'summary';
const seedIdFile = 'test-seed-ids';
const containerName = 'data-test';
const log = logger;

const azureDataService = new AzureDataService({
  containerName,
  outputFile,
  log,
  outputDir,
  seedIdFile,
  summaryFilename,
  version,
});
```

## Available Functions

`getLatestIds`: downloads the latest datestamped file matching the provided `seedIdFile` from the specified Azure Storage location to the `outputDir`.

`getLatestData`: downloads the latest datestamped file matching the provided `version` and `outputFile` from the specified Azure Storage location to the `outputDir`.

All upload functions take a `startMoment` parameter used to datestamp the file. For more on the `moment` library, see the moment [documentation](https://momentjs.com/docs/).

`uploadData` uploads the file specified in `outputFile` from `outputDir` to Azure Storage, along with a datestamped and versioned copy.

`uploadIds` uploads the `localIdFile` file from `outputDir` to `seedIdFile` in Azure Storage, along with datestamped and versioned copy.

`uploadSummary` uploads the summary file from `outputDir` to Azure Storage, with an `outputFile` prefix, and a datestamp and version suffix.
