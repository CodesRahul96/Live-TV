const fs = require("fs");
const pkg = require("./node_modules/@vidstack/react/package.json");
fs.writeFileSync("exports.json", JSON.stringify(pkg.exports, null, 2));
console.log("Exports written to exports.json");
