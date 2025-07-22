import { Client, Databases, Storage, Users, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || ''); // You'll need to add this to your .env.local

const databases = new Databases(client);
const storage = new Storage(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

async function createCollections() {
  try {
    // Create Users Collection
    console.log('Creating users collection...');
    const usersCollection = await databases.createCollection(
      databaseId,
      'users',
      'Users',
      undefined,
      false,
      false
    );

    // Add attributes to users collection
    await databases.createStringAttribute(databaseId, usersCollection.$id, 'authId', 255, true);
    await databases.createStringAttribute(databaseId, usersCollection.$id, 'name', 255, true);
    await databases.createEmailAttribute(databaseId, usersCollection.$id, 'email', true);
    await databases.createStringAttribute(databaseId, usersCollection.$id, 'employeeCode', 50, true);
    await databases.createEnumAttribute(databaseId, usersCollection.$id, 'role', ['employee', 'admin'], true, 'employee');
    await databases.createDatetimeAttribute(databaseId, usersCollection.$id, 'createdAt', false);

    console.log('Users collection created successfully!');

    // Create Reports Collection
    console.log('Creating reports collection...');
    const reportsCollection = await databases.createCollection(
      databaseId,
      'reports',
      'Reports',
      undefined,
      false,
      false
    );

    // Add attributes to reports collection
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'employeeName', 255, true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'employeeCode', 50, true);
    await databases.createEnumAttribute(databaseId, reportsCollection.$id, 'employeeType', ['Full-Time', 'Part-Time', 'Contractor', 'Intern'], true, 'Full-Time');
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'department', 100, true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'description', 5000, true);
    await databases.createUrlAttribute(databaseId, reportsCollection.$id, 'image', false);
    await databases.createEnumAttribute(databaseId, reportsCollection.$id, 'status', ['Submitted', 'In Progress', 'Resolved', 'Closed'], true, 'Submitted');
    await databases.createDatetimeAttribute(databaseId, reportsCollection.$id, 'submittedAt', true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'submittedBy', 255, true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'reply', 5000, false);
    await databases.createDatetimeAttribute(databaseId, reportsCollection.$id, 'repliedAt', false);

    console.log('Reports collection created successfully!');

    console.log('Collection IDs:');
    console.log(`Users Collection ID: ${usersCollection.$id}`);
    console.log(`Reports Collection ID: ${reportsCollection.$id}`);

    // Update environment variables template
    console.log('\nAdd these to your .env.local:');
    console.log(`NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCollection.$id}`);
    console.log(`NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID=${reportsCollection.$id}`);

  } catch (error) {
    console.error('Error creating collections:', error);
  }
}

async function createStorageBucket() {
  try {
    console.log('Creating storage bucket...');
    const bucket = await storage.createBucket(
      'report-images',
      'Report Images',
      ['create', 'read', 'update', 'delete'],
      false,
      false,
      10485760, // 10MB
      ['jpg', 'jpeg', 'png', 'gif', 'webp']
    );

    console.log('Storage bucket created successfully!');
    console.log(`Bucket ID: ${bucket.$id}`);
    console.log('\nAdd this to your .env.local:');
    console.log(`NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=${bucket.$id}`);

  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
}

async function main() {
  console.log('Setting up Appwrite database...');
  
  await createCollections();
  await createStorageBucket();
  
  console.log('\n✅ Appwrite setup completed!');
  console.log('\nNext steps:');
  console.log('1. Update your .env.local with the collection and bucket IDs shown above');
  console.log('2. Set up collection permissions in the Appwrite Console');
  console.log('3. Restart your development server');
}

if (require.main === module) {
  main();
}
