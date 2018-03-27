const fs = require('fs');

function loadJsonSync(path) {
  const jsonString = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : undefined;
  return jsonString ? JSON.parse(jsonString) : undefined;
}

module.exports = {
  loadJsonSync,
};
