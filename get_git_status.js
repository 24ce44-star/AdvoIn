const { execSync } = require("child_process");
const fs = require("fs");

try {
  const result = execSync("git status");
  fs.writeFileSync("git_status_output.txt", result);
} catch (e) {
  fs.writeFileSync(
    "git_status_output.txt",
    e.stderr ? e.stderr.toString() : e.message,
  );
}
