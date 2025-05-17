import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NotionClient } from './client.js';

/**
 * Register Notion API tools with an MCP server
 * @param server - MCP server instance
 * @param notionClient - Notion API client
 * @param toolConfig - Configuration object specifying which tools are enabled
 */
export function registerNotionTools(server: McpServer, notionClient: NotionClient, toolConfig: Record<string, boolean>) {
  // User-related tools
  if (toolConfig['get-current-user'] !== false) {
    server.tool(
      'get-current-user',
      'Get information about the current authenticated user (bot)',
      {},
      async () => {
        try {
          const user = await notionClient.getMe();
          return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error fetching current user: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  if (toolConfig['list-users'] !== false) {
    server.tool(
      'list-users',
      'List all users in the workspace',
      {
        startCursor: z.string().optional().describe('Pagination cursor'),
        pageSize: z.number().min(1).max(100).optional().describe('Number of users to return (max 100)'),
      },
      async ({ startCursor, pageSize }) => {
        try {
          const users = await notionClient.listUsers(startCursor, pageSize);
          return { content: [{ type: 'text', text: JSON.stringify(users, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error listing users: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  // Search tool
  if (toolConfig['search'] !== false) {
    server.tool(
      'search',
      'Search for pages or databases in Notion workspace',
      {
        query: z.string().optional().describe('Search query'),
        filter: z.enum(['page', 'database']).optional().describe('Filter by object type'),
        sort: z.enum(['last_edited_time']).optional().describe('Sort by property'),
        sortDirection: z.enum(['ascending', 'descending']).optional().describe('Sort direction'),
        pageSize: z.number().min(1).max(100).optional().describe('Number of results to return (max 100)'),
        startCursor: z.string().optional().describe('Pagination cursor'),
      },
      async ({ query, filter, sort, sortDirection, pageSize, startCursor }) => {
        try {
          const searchParams: any = {};
          
          if (query) searchParams.query = query;
          if (startCursor) searchParams.start_cursor = startCursor;
          if (pageSize) searchParams.page_size = pageSize;
          
          if (filter) {
            searchParams.filter = {
              property: 'object',
              value: filter
            };
          }
          
          if (sort) {
            searchParams.sort = {
              timestamp: sort,
              direction: sortDirection || 'descending'
            };
          }
          
          const results = await notionClient.search(searchParams);
          return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error searching Notion: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  // Page-related tools
  if (toolConfig['get-page'] !== false) {
    server.tool(
      'get-page',
      'Retrieve a page by ID',
      {
        pageId: z.string().describe('ID of the page to retrieve'),
      },
      async ({ pageId }) => {
        try {
          const page = await notionClient.getPage(pageId);
          return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error retrieving page: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  if (toolConfig['create-page'] !== false) {
    server.tool(
      'create-page',
      'Create a new page in Notion',
      {
        parentType: z.enum(['page_id', 'database_id']).describe('Type of the parent (page or database)'),
        parentId: z.string().describe('ID of the parent page or database'),
        title: z.string().describe('Title of the page'),
        properties: z.record(z.any()).optional().describe('Additional properties for the page'),
        content: z.string().optional().describe('Content for the page'),
      },
      async ({ parentType, parentId, title, properties, content }) => {
        try {
          // Prepare page properties based on parent type
          let pageProperties: Record<string, any> = {};
          
          if (parentType === 'database_id') {
            // For database parent, use properties parameter or create title property
            pageProperties = properties || {};
            if (title && !pageProperties['Name']) {
              pageProperties['Name'] = {
                title: [
                  {
                    type: 'text',
                    text: { content: title }
                  }
                ]
              };
            }
          } else {
            // For page parent, create title property
            pageProperties = {
              title: [
                {
                  type: 'text',
                  text: { content: title }
                }
              ]
            };
          }
          
          // Prepare children blocks if content is provided
          const children = content ? [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content }
                  }
                ]
              }
            }
          ] : undefined;
          
          const page = await notionClient.createPage({
            parent: {
              type: parentType,
              [parentType]: parentId
            },
            properties: pageProperties,
            children
          });
          
          return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error creating page: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  // Database-related tools
  if (toolConfig['get-database'] !== false) {
    server.tool(
      'get-database',
      'Retrieve a database by ID',
      {
        databaseId: z.string().describe('ID of the database to retrieve'),
      },
      async ({ databaseId }) => {
        try {
          const database = await notionClient.getDatabase(databaseId);
          return { content: [{ type: 'text', text: JSON.stringify(database, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error retrieving database: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  if (toolConfig['create-database'] !== false) {
    server.tool(
      'create-database',
      'Create a new database in Notion',
      {
        parentId: z.string().describe('ID of the parent page'),
        title: z.string().describe('Title for the database'),
        properties: z.record(z.any()).optional().describe('Database properties/columns schema'),
      },
      async ({ parentId, title, properties }) => {
        try {
          // Create default properties if not provided
          const dbProperties = properties || {
            Name: {
              title: {}
            }
          };
          
          const database = await notionClient.createDatabase({
            parent: {
              type: 'page_id',
              page_id: parentId
            },
            title: [
              {
                type: 'text',
                text: { content: title }
              }
            ],
            properties: dbProperties
          });
          
          return { content: [{ type: 'text', text: JSON.stringify(database, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error creating database: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  if (toolConfig['query-database'] !== false) {
    server.tool(
      'query-database',
      'Query a database to retrieve its pages',
      {
        databaseId: z.string().describe('ID of the database to query'),
        filter: z.record(z.any()).optional().describe('Filter conditions'),
        sorts: z.array(z.any()).optional().describe('Sort conditions'),
        startCursor: z.string().optional().describe('Pagination cursor'),
        pageSize: z.number().min(1).max(100).optional().describe('Number of results to return (max 100)'),
      },
      async ({ databaseId, filter, sorts, startCursor, pageSize }) => {
        try {
          const queryParams: any = {};
          
          if (filter) queryParams.filter = filter;
          if (sorts) queryParams.sorts = sorts;
          if (startCursor) queryParams.start_cursor = startCursor;
          if (pageSize) queryParams.page_size = pageSize;
          
          const results = await notionClient.queryDatabase(databaseId, queryParams);
          return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error querying database: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  // Block-related tools
  if (toolConfig['get-block-children'] !== false) {
    server.tool(
      'get-block-children',
      'Retrieve children blocks of a block or page',
      {
        blockId: z.string().describe('ID of the block or page'),
        startCursor: z.string().optional().describe('Pagination cursor'),
        pageSize: z.number().min(1).max(100).optional().describe('Number of results to return (max 100)'),
      },
      async ({ blockId, startCursor, pageSize }) => {
        try {
          const blocks = await notionClient.getBlockChildren(blockId, startCursor, pageSize);
          return { content: [{ type: 'text', text: JSON.stringify(blocks, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error retrieving block children: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  if (toolConfig['append-block-children'] !== false) {
    server.tool(
      'append-block-children',
      'Append blocks to a parent block or page',
      {
        blockId: z.string().describe('ID of the parent block or page'),
        content: z.string().describe('Text content to add as a paragraph'),
      },
      async ({ blockId, content }) => {
        try {
          const blocks = await notionClient.appendBlockChildren(blockId, [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content }
                  }
                ]
              }
            }
          ]);
          
          return { content: [{ type: 'text', text: JSON.stringify(blocks, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error appending blocks: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  // Comment-related tools
  if (toolConfig['get-comments'] !== false) {
    server.tool(
      'get-comments',
      'Retrieve comments from a block or page',
      {
        blockId: z.string().describe('ID of the block or page'),
        startCursor: z.string().optional().describe('Pagination cursor'),
        pageSize: z.number().min(1).max(100).optional().describe('Number of results to return (max 100)'),
      },
      async ({ blockId, startCursor, pageSize }) => {
        try {
          const comments = await notionClient.getComments(blockId, startCursor, pageSize);
          return { content: [{ type: 'text', text: JSON.stringify(comments, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error retrieving comments: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  if (toolConfig['create-comment'] !== false) {
    server.tool(
      'create-comment',
      'Create a comment on a page',
      {
        pageId: z.string().describe('ID of the page to comment on'),
        text: z.string().describe('Comment text content'),
      },
      async ({ pageId, text }) => {
        try {
          const comment = await notionClient.createComment({
            parent: {
              page_id: pageId
            },
            rich_text: [
              {
                type: 'text',
                text: { content: text }
              }
            ]
          });
          
          return { content: [{ type: 'text', text: JSON.stringify(comment, null, 2) }] };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error creating comment: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }

  // Add a new tool to get all pages
  if (toolConfig['get-all-pages'] !== false) {
    server.tool(
      'get-all-pages',
      'Retrieve all pages from Notion that the integration has access to',
      {
        startCursor: z.string().optional().describe('Pagination cursor for getting the next batch of results'),
        pageSize: z.number().min(1).max(100).optional().describe('Number of results to return per request (max 100)'),
      },
      async ({ startCursor, pageSize = 100 }) => {
        try {
          // Using search with empty query returns all pages the integration has access to
          const results = await notionClient.search({
            filter: {
              value: 'page',
              property: 'object'
            },
            page_size: pageSize,
            start_cursor: startCursor
          });
          
          return { 
            content: [
              { 
                type: 'text', 
                text: `Found ${results.results.length} pages. ${results.has_more ? 'More pages available.' : 'No more pages available.'}\n\n${JSON.stringify(results, null, 2)}` 
              }
            ] 
          };
        } catch (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error retrieving pages: ${error instanceof Error ? error.message : String(error)}` 
            }] 
          };
        }
      }
    );
  }
} 