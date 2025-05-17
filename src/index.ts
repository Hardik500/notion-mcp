import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NotionClient } from "./notion/client.js";
import { registerNotionTools } from "./notion/tools.js";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variable
const apiKey = process.env.NOTION_API_KEY;
if (!apiKey) {
	throw new Error("NOTION_API_KEY environment variable is required");
}

// Create Notion API client
const notionClient = new NotionClient(apiKey);

// Define which tools are enabled. By default, all are enabled.
// To disable a tool, set its value to false.
// Example: 'create-page': false
const toolConfig: Record<string, boolean> = {
	'get-current-user': true,
	'list-users': true,
	'search': true,
	'get-page': true,
	'create-page': true,
	'get-database': false,
	'create-database': false,
	'query-database': false,
	'get-block-children': true,
	'append-block-children': true,
	'get-comments': false,
	'create-comment': false,
	'get-all-pages': true,
	// Add other tools here as they are created
};

// Create MCP server instance
const server = new McpServer({
	name: "notion",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {},
	},
});

// Register Notion tools
registerNotionTools(server, notionClient, toolConfig);

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("Notion MCP Server running on stdio");
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
