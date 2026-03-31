const { execSync } = require("child_process");
try {
  const result = execSync("git restore app/(tabs)");
  console.log("Success:", result.toString());
} catch (e) {
  console.error("Error:", e.stderr ? e.stderr.toString() : e);
}
