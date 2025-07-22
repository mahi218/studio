import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite client for client-side operations
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize services for client-side operations
export const clientAccount = new Account(client);
export const clientDatabases = new Databases(client);
export const clientStorage = new Storage(client);

// Re-export for convenience
export { ID, Query };

// Export client for advanced usage
export { client as clientAppwrite };
