import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
export const REPORTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID || '';
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '';

// Admin credentials
export const ADMIN_EMAIL = process.env.APPWRITE_ADMIN_EMAIL || 'admin@issuetrack.com';
export const ADMIN_PASSWORD = process.env.APPWRITE_ADMIN_PASSWORD || 'admin123456';

// Helper function to generate IDs
export { ID };
export { Query };

// Export client for advanced usage
export { client };
