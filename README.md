# Notion MCP for Claude

A Model Context Protocol (MCP) server for Notion integration with Claude, allowing Claude to interact with your Notion workspace.

## Features

- **User Management**: Get information about users in your workspace
- **Page Operations**: Create, retrieve, and update pages
- **Database Operations**: Create, query, and manage databases 
- **Block Operations**: Retrieve and append blocks to pages or other blocks
- **Comment Operations**: Add and retrieve comments
- **Search**: Search across your Notion workspace

## Prerequisites

- Node.js (v18 or later)
- A Notion integration with an API key
- Claude Desktop app for using this MCP

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/notion-mcp.git
   cd notion-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with pnpm
   pnpm install
   ```

3. Build the project:
   ```bash
   npm run build
   # or with pnpm
   pnpm build
   ```

## Configuration

1. **Notion API Key**: Create a Notion integration at [https://www.notion.com/my-integrations](https://www.notion.com/my-integrations) and get your API key.

2. **Set up environment variables**: There are two ways to provide your Notion API key:

   **Option 1**: Using a .env file (recommended for development):
   - Create a `.env` file in the root directory with the following content:
     ```
     NOTION_API_KEY=your_notion_integration_secret_here
     ```

   **Option 2**: Setting the environment variable directly:
   ```bash
   export NOTION_API_KEY=your_notion_api_key
   ```

3. **Connect Notion Integration**: For each page you want to access via Claude, you need to share it with your integration:
   - Open a Notion page
   - Click "..." in the upper right corner
   - Choose "Add connections"
   - Select your integration

## Integration with Claude Desktop

1. Create a configuration file for Claude Desktop:
   - macOS: `~/Library/ApplicationSupport/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "notion": {
         "command": "node",
         "args": ["/full/path/to/notion-mcp/build/index.js"],
         "env": {
           "NOTION_API_KEY": "your_notion_api_key"
         }
       }
     }
   }
   ```

   **Note**: If you're using a `.env` file during development, you can modify the configuration to:
   ```json
   {
     "mcpServers": {
       "notion": {
         "command": "node",
         "args": ["-r", "dotenv/config", "/full/path/to/notion-mcp/build/index.js"]
       }
     }
   }
   ```
   This will automatically load your `.env` file.

3. Replace `/full/path/to/notion-mcp` with the actual path to your project and `your_notion_api_key` with your Notion API token (if using the first configuration option).

4. Restart Claude Desktop. The Notion MCP should now be available as a tool.

## Available Tools

- `get-current-user`: Get information about the authenticated user/bot
- `list-users`: List all users in the workspace
- `search`: Search for pages or databases
- `get-page`: Retrieve a page by ID
- `create-page`: Create a new page
- `get-database`: Retrieve a database by ID
- `create-database`: Create a new database
- `query-database`: Query a database to retrieve its pages
- `get-block-children`: Retrieve children blocks of a block or page
- `append-block-children`: Append blocks to a parent block or page
- `get-comments`: Retrieve comments from a block or page
- `create-comment`: Create a comment on a page

## Example Prompts for Claude

```
Get information about my Notion account:
"Can you show me information about my Notion integration/bot?"

Create a new database:
"Create a new Notion database called 'Project Tasks' in page 98ad959b-2b6a-4774-80ee-00246fb0ea9b"

Search for content:
"Search my Notion workspace for pages about marketing"

Create a new page with content:
"Create a new page in my Notion database 668d797c-76fa-4934-9b05-ad288df2d136 with the title 'Meeting Notes' and add today's date in the content"
```

## Development

- **Build**: `npm run build`
- **Run in development mode**: `npm run dev`
- **Start**: `npm start`

## License

ISC 