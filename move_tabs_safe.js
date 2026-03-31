const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "app", "(tabs)");
const dest = path.join(__dirname, "app", "(client)", "(tabs)");

try {
  fs.renameSync(src, dest);
  console.log("Successfully moved");
} catch (e) {
  console.error(e);
}
