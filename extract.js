const logs = require(process.env.CLAUDE_CODE_EXECUTION_FILE);

if (!Array.isArray(logs)) {
  console.error("Invalid logs format. Expected an array.");
  process.exit(1);
}

const report = logs
  .filter(
    (log) => log.type === "assistant" && Array.isArray(log.message?.content)
  )
  .flatMap((log) => log.message.content)
  .filter((item) => item.type === "text")
  .map((item) => item.text?.trim())
  .find((text) => text?.startsWith("## Renovate PR Review Results\n"));

if (report == null) {
  console.error("No report found in the logs.");
  process.exit(1);
}

console.log(report);
