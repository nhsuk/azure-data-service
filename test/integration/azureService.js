const fs = require('fs');
const chai = require('chai');
const nock = require('nock');

const azureService = require('../../lib/azureService');

const expect = chai.expect;
// writing to a shared area, timestamp file to avoid collisions
const name = `${new Date().getTime()}test.json`;
const timeout = 15000;

function connectionStringToSettings(cs) {
  return cs.split(';').reduce((acc, curr) => {
    const [field, val] = curr.split('=');
    acc[field] = val;
    return acc;
  }, {});
}

function getEndpointUrl() {
  // mocked endpoint changes depending on ENV var, build up the mocked URL
  const settings = connectionStringToSettings(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const port = settings.DefaultEndpointsProtocol === 'https' ? ':443' : '';
  return `${settings.DefaultEndpointsProtocol}://${settings.AccountName}.blob.core.windows.net${port}`;
}

describe('Azure Service', () => {
  describe('upload, list and delete functions', () => {
    after(function deleteGeneratedFile(done) {
      this.timeout(timeout);
      azureService.deleteFromAzure(name).then(() => done());
    });

    it('should upload file to azure', function test(done) {
      this.timeout(timeout);
      azureService.uploadToAzure('test/output/test-file.json', name)
        .then((result) => {
          expect(result.name).to.equal(name);
          done();
        })
        .catch(done);
    });

    it('should list files in blob', function test(done) {
      this.timeout(timeout);
      azureService.listBlobs()
        .then((entries) => {
          expect(entries).to.exist;
          done();
        })
        .catch(done);
    });
  });

  describe('getLatestBlob', () => {
    it('should return the most recent blob based on the date embedded within the file name for those files that pass the filter applied', (done) => {
      const blobList = fs.readFileSync('test/resources/blobList.xml', 'utf8');
      nock(getEndpointUrl())
        .get('/etl-test')
        .query({ restype: 'container', comp: 'list' })
        .reply(200, blobList);

      const filter = b => b.name.startsWith('filter-match-');

      azureService.getLatestBlob(filter)
        .then((latestBlob) => {
          expect(latestBlob.name).to.equal('filter-match-20180228.json');
          done();
        })
        .catch(done);
    });
  });
});
