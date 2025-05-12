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
registerNotionTools(server, notionClient);

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
