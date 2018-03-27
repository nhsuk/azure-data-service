const azure = require('azure-storage');

const config = require('./config');
const sortByFilename = require('./sortByFilenameDateDesc');

const blobSvc = azure.createBlobService();
const options = {
  clientRequestTimeoutInMs: config.azureTimeoutMinutes * 60 * 1000,
};

function listBlobs(containerName) {
  return new Promise((resolve, reject) => {
    blobSvc.listBlobsSegmented(containerName, null, (error, result) => {
      if (!error) {
        resolve(result.entries);
      } else {
        reject(error);
      }
    });
  });
}

function uploadToAzure(containerName, filename, blobName) {
  return new Promise((resolve, reject) => {
    blobSvc.createBlockBlobFromLocalFile(
      containerName, blobName, filename, options,
      (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  });
}

function downloadFromAzure(containerName, filename, blobName) {
  return new Promise((resolve, reject) => {
    blobSvc.getBlobToLocalFile(
      containerName, blobName, filename, options,
      (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  });
}

function deleteFromAzure(containerName, blobName) {
  return new Promise((resolve, reject) => {
    blobSvc.deleteBlob(containerName, blobName, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  });
}

async function getLatestBlob(containerName, filter) {
  return (await listBlobs(containerName))
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
