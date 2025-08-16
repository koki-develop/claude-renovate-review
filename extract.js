const logs = require(process.env.CLAUDE_CODE_EXECUTION_FILE);

if (!Array.isArray(logs)) {
  console.error("Invalid logs format. Expected an array.");
  process.exit(1);
}

const report = (() => {
  for (const log of logs) {
    if (log.type === "assistant" && Array.isArray(log.message?.content)) {
      for (const item of log.message.content) {
        // Extract report
        if (
          item.type === "text" &&
          item.text.includes("## Renovate PR Review Results")
        ) {
          // Extract from "## Renovate PR Review Results" onwards
          const startIndex = item.text.indexOf("## Renovate PR Review Results");
          return item.text.substring(startIndex).trim();
        }
      }
    }
  }

  return null;
})();

if (report == null) {
  console.error("No report found in the logs.");
  process.exit(1);
}

console.log(report);
