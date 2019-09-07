const fs = require("fs");

const filename = "database.json";
let data;

function addKey(path) {
  let currentData = data;
  path.forEach(key => {
    if (!(key in currentData)) {
      currentData[key] = {};
    }
    currentData = currentData[key];
  });
}

if (fs.existsSync(filename)) {
  data = JSON.parse(fs.readFileSync(filename));
} else {
  data = {};
  write();
}

function write() {
  fs.writeFileSync(filename, JSON.stringify(data));
}

module.exports = { data, write, addKey };
