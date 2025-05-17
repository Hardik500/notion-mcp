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
      const data = await response.json();
      
      if (!response.ok) {
        // Enhanced error handling with more details
        const error = new Error(
          `Notion API error: ${response.status} - ${data.message || JSON.stringify(data)}\n` +
          `Endpoint: ${endpoint}\n` +
          `Request ID: ${data.request_id || 'unknown'}`
        );
        console.error('Notion API Error Details:', {
          status: response.status,
          endpoint,
          error: data,
          requestId: data.request_id
        });
        throw error;
      }
      
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error in Notion API request: ${error}`);
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

  private validateUUID(uuid: string): string {
    if (!uuid) {
      throw new Error('Notion ID cannot be empty');
    }
    
    // Remove any quotes, whitespace, and normalize dashes
    uuid = uuid.trim().replace(/['"]/g, '').replace(/\s/g, '');
    
    // Remove all dashes first
    const cleanUuid = uuid.replace(/-/g, '');
    
    // Check if it's a 32-character hexadecimal string
    if (!/^[0-9a-f]{32}$/i.test(cleanUuid)) {
      throw new Error(`Invalid Notion ID format: ${uuid}. Expected a 32-character hexadecimal string.`);
    }
    
    // Return properly formatted UUID
    return `${cleanUuid.slice(0,8)}-${cleanUuid.slice(8,12)}-${cleanUuid.slice(12,16)}-${cleanUuid.slice(16,20)}-${cleanUuid.slice(20)}`;
  }

  /**
   * Retrieves a page by ID
   */
  async getPage(pageId: string) {
    pageId = this.validateUUID(pageId);
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
    // Validate UUID if parent is a page
    if (params.parent.type === 'page_id') {
      params.parent.page_id = this.validateUUID(params.parent.page_id);
    } else if (params.parent.type === 'database_id') {
      params.parent.database_id = this.validateUUID(params.parent.database_id);
    }
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
    pageId = this.validateUUID(pageId);
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
  async getBlockChildren(blockId: string, params?: { start_cursor?: string; page_size?: number }) {
    blockId = this.validateUUID(blockId);
    return this.request<NotionResponse.ListBlocks>(`/v1/blocks/${blockId}/children`, 'GET', params);
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