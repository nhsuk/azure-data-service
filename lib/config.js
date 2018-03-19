module.exports = {
  azureTimeoutMinutes: process.env.AZURE_TIMEOUT_MINUTES || 5,
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  etlName: process.env.ETL_NAME || 'etl-toolkit',
};
