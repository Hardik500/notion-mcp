import { NotionResponse } from './types.js';

/**
 * Notion API client for making requests to the Notion API
 */
export class NotionClient {
  private apiKey: string;
  private baseUrl: string;
  private apiVersion: string;

  /**
   * Creates a new Notion API client
   * @param apiKey - Notion API key
   * @param baseUrl - Optional base URL for the Notion API
   * @param apiVersion - Optional API version
   */
  constructor(apiKey: string, baseUrl = 'https://api.notion.com', apiVersion = '2022-06-28') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.apiVersion = apiVersion;
  }

  /**
   * Makes a request to the Notion API
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param body - Optional request body
   * @returns Response data
   */
  async request<T>(endpoint: string, method = 'GET', body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': this.apiVersion
    };

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Notion API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('Error in Notion API request:', error);
      throw error;
    }
  }

  /**
   * Retrieves the current user (me)
   */
  async getMe() {
    return this.request<NotionResponse.User>('/v1/users/me');
  }

  /**
   * Lists all users in the workspace
   */
  async listUsers(startCursor?: string, pageSize = 100) {
    const query = new URLSearchParams();
    if (startCursor) query.set('start_cursor', startCursor);
    if (pageSize) query.set('page_size', pageSize.toString());
    
    const queryString = query.toString() ? `?${query}` : '';
    return this.request<NotionResponse.ListUsers>(`/v1/users${queryString}`);
  }

  /**
   * Retrieves a user by ID
   */
  async getUser(userId: string) {
    return this.request<NotionResponse.User>(`/v1/users/${userId}`);
  }

  /**
   * Searches Notion workspace
   */
  async search(params: {
    query?: string;
    filter?: { value: 'page' | 'database'; property: 'object' };
    sort?: { direction: 'ascending' | 'descending'; timestamp: 'last_edited_time' };
    start_cursor?: string;
    page_size?: number;
  }) {
    return this.request<NotionResponse.SearchResults>('/v1/search', 'POST', params);
  }

  /**
   * Retrieves a page by ID
   */
  async getPage(pageId: string) {
    return this.request<NotionResponse.Page>(`/v1/pages/${pageId}`);
  }

  /**
   * Creates a new page
   */
  async createPage(params: {
    parent: { type: 'page_id' | 'database_id'; [key: string]: any };
    properties: Record<string, any>;
    children?: any[];
    icon?: any;
    cover?: any;
  }) {
    return this.request<NotionResponse.Page>('/v1/pages', 'POST', params);
  }

  /**
   * Updates page properties
   */
  async updatePage(pageId: string, params: {
    properties?: Record<string, any>;
    archived?: boolean;
    icon?: any;
    cover?: any;
  }) {
    return this.request<NotionResponse.Page>(`/v1/pages/${pageId}`, 'PATCH', params);
  }

  /**
   * Retrieves a database by ID
   */
  async getDatabase(databaseId: string) {
    return this.request<NotionResponse.Database>(`/v1/databases/${databaseId}`);
  }

  /**
   * Creates a new database
   */
  async createDatabase(params: {
    parent: { type: 'page_id'; page_id: string };
    title: any[];
    properties: Record<string, any>;
  }) {
    return this.request<NotionResponse.Database>('/v1/databases', 'POST', params);
  }

  /**
   * Queries a database
   */
  async queryDatabase(databaseId: string, params?: {
    filter?: any;
    sorts?: any[];
    start_cursor?: string;
    page_size?: number;
  }) {
    return this.request<NotionResponse.QueryResults>(
      `/v1/databases/${databaseId}/query`, 
      'POST', 
      params
    );
  }

  /**
   * Retrieves a block by ID
   */
  async getBlock(blockId: string) {
    return this.request<NotionResponse.Block>(`/v1/blocks/${blockId}`);
  }

  /**
   * Retrieves a block's children
   */
  async getBlockChildren(blockId: string, startCursor?: string, pageSize = 100) {
    const query = new URLSearchParams();
    if (startCursor) query.set('start_cursor', startCursor);
    if (pageSize) query.set('page_size', pageSize.toString());
    
    const queryString = query.toString() ? `?${query}` : '';
    return this.request<NotionResponse.ListBlocks>(`/v1/blocks/${blockId}/children${queryString}`);
  }

  /**
   * Appends blocks to a parent block
   */
  async appendBlockChildren(blockId: string, children: any[]) {
    return this.request<NotionResponse.AppendBlockChildrenResponse>(
      `/v1/blocks/${blockId}/children`, 
      'PATCH', 
      { children }
    );
  }

  /**
   * Retrieves comments from a block
   */
  async getComments(blockId: string, startCursor?: string, pageSize = 100) {
    const query = new URLSearchParams();
    query.set('block_id', blockId);
    if (startCursor) query.set('start_cursor', startCursor);
    if (pageSize) query.set('page_size', pageSize.toString());
    
    const queryString = query.toString() ? `?${query}` : '';
    return this.request<NotionResponse.ListComments>(`/v1/comments${queryString}`, 'GET');
  }

  /**
   * Creates a comment on a page or block
   */
  async createComment(params: {
    parent: { page_id: string } | { block_id: string; };
    rich_text: any[];
    discussion_id?: string;
  }) {
    return this.request<NotionResponse.Comment>('/v1/comments', 'POST', params);
  }
} 