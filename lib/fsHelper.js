const fs = require('fs');

function saveJsonSync(obj, path) {
  const json = JSON.stringify(obj);
  fs.writeFileSync(path, json, 'utf8');
}

function loadJsonSync(path) {
  const jsonString = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : undefined;
  return jsonString ? JSON.parse(jsonString) : undefined;
}

module.exports = {
  loadJsonSync,
  saveJsonSync,
};
