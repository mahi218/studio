// Manual setup for remaining Appwrite collections
// Run this after you have your API key

const { Client, Databases, Storage } = require('node-appwrite');
const path = require('path');
const fs = require('fs');

// Read environment variables from Frontend/.env.local
const envPath = path.join(__dirname, '..', 'Frontend', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse .env.local
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const client = new Client();
client
  .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const databaseId = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function createReportsCollection() {
  try {
    console.log('Creating reports collection...');
    
    // Create Reports Collection
    const reportsCollection = await databases.createCollection(
      databaseId,
      'reports',
      'Reports'
    );

    console.log('Reports collection created:', reportsCollection.$id);

    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add attributes to reports collection
    console.log('Adding attributes to reports collection...');
    
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'employeeName', 255, true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'employeeCode', 50, true);
    await databases.createEnumAttribute(databaseId, reportsCollection.$id, 'employeeType', ['Full-Time', 'Part-Time', 'Contractor', 'Intern'], true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'department', 100, true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'description', 5000, true);
    await databases.createUrlAttribute(databaseId, reportsCollection.$id, 'image', false);
    await databases.createEnumAttribute(databaseId, reportsCollection.$id, 'status', ['Submitted', 'In Progress', 'Resolved', 'Closed'], true);
    await databases.createDatetimeAttribute(databaseId, reportsCollection.$id, 'submittedAt', true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'submittedBy', 255, true);
    await databases.createStringAttribute(databaseId, reportsCollection.$id, 'reply', 5000, false);
    await databases.createDatetimeAttribute(databaseId, reportsCollection.$id, 'repliedAt', false);

    console.log('✅ Reports collection setup completed!');
    console.log(`Reports Collection ID: ${reportsCollection.$id}`);
    
    return reportsCollection.$id;
  } catch (error) {
    console.error('Error creating reports collection:', error);
    throw error;
  }
}

async function createStorageBucket() {
  try {
    console.log('Creating storage bucket...');
    
    const bucket = await storage.createBucket(
      'report-images',
      'Report Images'
    );

    console.log('✅ Storage bucket created!');
    console.log(`Bucket ID: ${bucket.$id}`);
    
    return bucket.$id;
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Setting up remaining Appwrite resources...');
    
    const reportsCollectionId = await createReportsCollection();
    const bucketId = await createStorageBucket();
    
    console.log('\n🎉 Setup completed!');
    console.log('\nUpdate your .env.local with these values:');
    console.log(`NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID=${reportsCollectionId}`);
    console.log(`NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=${bucketId}`);
    
  } catch (error) {
    console.error('Setup failed:', error);
    console.log('\nPlease check:');
    console.log('1. Your API key is correct');
    console.log('2. API key has proper permissions');
    console.log('3. Network connection is stable');
  }
}

if (require.main === module) {
  main();
}
