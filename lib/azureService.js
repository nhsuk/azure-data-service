const azure = require('azure-storage');

const sortByFilename = require('./sortByFilenameDateDesc');
const config = require('./config');

const blobSvc = azure.createBlobService();
const options = {
  clientRequestTimeoutInMs: config.azureTimeoutMinutes * 60 * 1000,
};

function listBlobs() {
  return new Promise((resolve, reject) => {
    blobSvc.listBlobsSegmented(config.containerName, null, (error, result) => {
      if (!error) {
        resolve(result.entries);
      }
      reject(error);
    });
  });
}

function uploadToAzure(filename, blobName) {
  return new Promise((resolve, reject) => {
    blobSvc.createBlockBlobFromLocalFile(
      config.containerName, blobName, filename, options,
      (error, result) => {
        if (!error) {
          resolve(result);
        }
        reject(error);
      }
    );
  });
}

function downloadFromAzure(filename, blobName) {
  return new Promise((resolve, reject) => {
    blobSvc.getBlobToLocalFile(
      config.containerName, blobName, filename, options,
      (error, result) => {
        if (!error) {
          resolve(result);
        }
        reject(error);
      }
    );
  });
}

function deleteFromAzure(blobName) {
  return new Promise((resolve, reject) => {
    blobSvc.deleteBlob(config.containerName, blobName, (error, result) => {
      if (!error) {
        resolve(result);
      }
      reject(error);
    });
  });
}

async function getLatestBlob(filter) {
  return (await listBlobs())
    .filter(filter)
    .sort(sortByFilename)[0];
}

module.exports = {
  deleteFromAzure,
  downloadFromAzure,
  getLatestBlob,
  listBlobs,
  uploadToAzure,
};
