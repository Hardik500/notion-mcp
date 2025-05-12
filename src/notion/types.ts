/**
 * Type definitions for Notion API responses
 */
export namespace NotionResponse {
  export interface User {
    object: string;
    id: string;
    type: string;
    name: string;
    avatar_url: string | null;
    person?: {
      email: string;
    };
    bot?: {
      owner: {
        type: string;
        user?: User;
        workspace?: boolean;
      };
    };
  }

  export interface ListUsers {
    object: 'list';
    results: User[];
    next_cursor: string | null;
    has_more: boolean;
  }

  export interface Page {
    object: 'page';
    id: string;
    created_time: string;
    last_edited_time: string;
    created_by: {
      object: 'user';
      id: string;
    };
    last_edited_by: {
      object: 'user';
      id: string;
    };
    cover: {
      type: string;
      [key: string]: any;
    } | null;
    icon: {
      type: string;
      [key: string]: any;
    } | null;
    parent: {
      type: 'database_id' | 'page_id' | 'workspace';
      [key: string]: any;
    };
    archived: boolean;
    properties: Record<string, any>;
    url: string;
  }

  export interface Database {
    object: 'database';
    id: string;
    created_time: string;
    last_edited_time: string;
    title: any[];
    description: any[];
    icon: {
      type: string;
      [key: string]: any;
    } | null;
    cover: {
      type: string;
      [key: string]: any;
    } | null;
    properties: Record<string, any>;
    parent: {
      type: 'page_id' | 'workspace';
      [key: string]: any;
    };
    url: string;
    archived: boolean;
    is_inline: boolean;
  }

  export interface QueryResults {
    object: 'list';
    results: Page[];
    next_cursor: string | null;
    has_more: boolean;
  }

  export interface Block {
    object: 'block';
    id: string;
    created_time: string;
    last_edited_time: string;
    has_children: boolean;
    archived: boolean;
    type: string;
    [key: string]: any;
  }

  export interface ListBlocks {
    object: 'list';
    results: Block[];
    next_cursor: string | null;
    has_more: boolean;
  }

  export interface AppendBlockChildrenResponse {
    object: 'list';
    results: Block[];
  }

  export interface Comment {
    object: 'comment';
    id: string;
    parent: {
      type: 'page_id' | 'block_id';
      [key: string]: any;
    };
    discussion_id: string;
    created_time: string;
    last_edited_time: string;
    created_by: {
      object: 'user';
      id: string;
    };
    rich_text: any[];
  }

  export interface ListComments {
    object: 'list';
    results: Comment[];
    next_cursor: string | null;
    has_more: boolean;
  }

  export interface SearchResults {
    object: 'list';
    results: (Page | Database)[];
    next_cursor: string | null;
    has_more: boolean;
  }
} 