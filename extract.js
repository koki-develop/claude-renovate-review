const logs = require(process.env.CLAUDE_CODE_EXECUTION_FILE);

if (!Array.isArray(logs)) {
  console.error("Invalid logs format. Expected an array.");
  process.exit(1);
}

const { report, toolUses, blockedToolUseIds } = logs.reduce(
  (acc, log) => {
    if (log.type === "assistant" && Array.isArray(log.message?.content)) {
      for (const item of log.message.content) {
        // Extract report
        if (
          item.type === "text" &&
          item.text.startsWith("## Renovate PR Review Results\n")
        ) {
          acc.report = item.text.trim();
          return acc;
        }

        // Extract tool uses
        if (item.type === "tool_use") {
          acc.toolUses[item.id] = { name: item.name, input: item.input };
          return acc;
        }
      }
    }

    if (log.type === "user" && Array.isArray(log.message?.content)) {
      for (const item of log.message.content) {
        // Extract tool errors
        if (
          item.type === "tool_result" &&
          item.is_error &&
          item.content &&
          item.content.startsWith("Claude requested permissions to use ") &&
          item.content.endsWith(", but you haven't granted it yet.")
        ) {
          acc.blockedToolUseIds.push(item.tool_use_id);
          return acc;
        }
      }
    }

    return acc;
  },
  {
    report: null,
    toolUses: {},
    blockedToolUseIds: [],
  }
);

if (report == null) {
  console.error("No report found in the logs.");
  process.exit(1);
}

const lines = [report];

if (blockedToolUseIds.length > 0) {
  lines.push(
    "",
    "---",
    "",
    "### 🚫 Permission Denied Tool Executions",
    "",
    "The following tool executions that Claude Code attempted were blocked due to insufficient permissions.  ",
    "Consider adding them to `allowed_tools` if needed.",
    "",
    "<details>",
    "<summary>Blocked Tool Executions</summary>",
    "",
    "| Tool | Input |",
    "| --- | --- |"
  );

  for (const toolUseId of blockedToolUseIds) {
    const toolUse = toolUses[toolUseId];
    if (toolUse) {
      lines.push(
        `| \`${toolUse.name}\` | \`${JSON.stringify(toolUse.input).replace(
          /\|/g,
          "\\|"
        )}\` |`
      );
    }
  }
}

console.log(lines.join("\n"));
