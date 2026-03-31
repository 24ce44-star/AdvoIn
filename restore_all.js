const { execSync } = require("child_process");
const fs = require("fs");

try {
  const result = execSync("git checkout HEAD -- .", { stdio: "pipe" });
  fs.writeFileSync("git_restore_output.txt", "Success: " + result.toString());
} catch (e) {
  fs.writeFileSync(
    "git_restore_output.txt",
    "Error: " + (e.stderr ? e.stderr.toString() : e.message),
  );
}
