const fs = require("fs-extra");
const path = require("path");

async function moveTabs() {
  const src = path.join(__dirname, "app", "(tabs)");
  const dest = path.join(__dirname, "app", "(client)", "(tabs)");

  if (fs.existsSync(src)) {
    try {
      await fs.move(src, dest, { overwrite: true });
      console.log("Successfully moved (tabs) to (client)/(tabs)");
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log("Source does not exist");
  }
}

moveTabs();
