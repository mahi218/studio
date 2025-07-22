# Appwrite Backend Setup Guide

This guide will help you set up Appwrite backend for your IssueTrack Pro application.

## Prerequisites

1. **Appwrite Cloud Account**: Sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
2. **Node.js**: Version 18 or higher

## Setup Steps

### 1. Create Appwrite Project

1. Log in to your Appwrite Console
2. Click "Create Project"
3. Enter project name: "IssueTrack Pro"
4. Copy the Project ID from the project settings

### 2. Configure Environment Variables

Update your `.env.local` file with your Appwrite project details:

```env
# Replace with your actual Appwrite project details
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id_here
NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID=your_reports_collection_id_here
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your_storage_bucket_id_here

# Server-side Appwrite Admin
APPWRITE_ADMIN_EMAIL=admin@issuetrack.com
APPWRITE_ADMIN_PASSWORD=admin123456

# Admin passcode for local fallback
ADMIN_PASSCODE=admin123
```

### 3. Create Database

1. In Appwrite Console, go to "Databases"
2. Click "Create Database"
3. Name: "IssueTrackDB"
4. Copy the Database ID and add it to your `.env.local`

### 4. Create Collections

#### Users Collection

1. In your database, click "Create Collection"
2. Name: "users"
3. Collection ID: Leave auto-generated or use "users"
4. Add these attributes:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| authId | String | 255 | Yes | - |
| name | String | 255 | Yes | - |
| email | Email | 255 | Yes | - |
| employeeCode | String | 50 | Yes | - |
| role | Enum | - | Yes | employee |
| createdAt | DateTime | - | No | - |

**Enum values for role**: `employee`, `admin`

5. Set Collection Permissions:
   - Create: Users
   - Read: Users
   - Update: Users
   - Delete: Users

#### Reports Collection

1. Click "Create Collection"
2. Name: "reports"
3. Collection ID: Leave auto-generated or use "reports"
4. Add these attributes:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| employeeName | String | 255 | Yes | - |
| employeeCode | String | 50 | Yes | - |
| employeeType | Enum | - | Yes | Full-Time |
| department | String | 100 | Yes | - |
| description | String | 5000 | Yes | - |
| image | URL | 2000 | No | - |
| status | Enum | - | Yes | Submitted |
| submittedAt | DateTime | - | Yes | - |
| submittedBy | String | 255 | Yes | - |
| reply | String | 5000 | No | - |
| repliedAt | DateTime | - | No | - |

**Enum values for employeeType**: `Full-Time`, `Part-Time`, `Contractor`, `Intern`

**Enum values for status**: `Submitted`, `In Progress`, `Resolved`, `Closed`

5. Set Collection Permissions:
   - Create: Users
   - Read: Users
   - Update: Users
   - Delete: Users

### 5. Create Storage Bucket

1. Go to "Storage" in Appwrite Console
2. Click "Create Bucket"
3. Name: "report-images"
4. Bucket ID: Leave auto-generated or use "report-images"
5. Set these permissions:
   - Create: Users
   - Read: Any
   - Update: Users
   - Delete: Users
6. Configure file settings:
   - Maximum File Size: 10MB
   - Allowed File Extensions: jpg, jpeg, png, gif, webp
7. Copy the Bucket ID and add it to your `.env.local`

### 6. Configure Authentication

1. Go to "Auth" > "Settings"
2. Enable "Email/Password" authentication
3. Set session length as desired (default 365 days is fine)

### 7. Update Collection IDs in Environment

After creating collections, update your `.env.local` with the actual IDs:

```env
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_actual_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_actual_users_collection_id
NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID=your_actual_reports_collection_id
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your_actual_storage_bucket_id
```

## Testing Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try registering a new employee account
3. Login and create a test report
4. Check your Appwrite Console to see the data

## Troubleshooting

### Common Issues

1. **Collection permissions errors**: Make sure permissions are set to "Users" for all operations
2. **Environment variables not loading**: Restart your development server after updating `.env.local`
3. **CORS errors**: Check that your domain is added to Appwrite project platforms
4. **File upload errors**: Verify storage bucket permissions and file size limits

### Adding Platform

In Appwrite Console:
1. Go to "Settings" > "Platforms"
2. Click "Add Platform" > "Web App"
3. Name: "IssueTrack Pro Frontend"
4. Hostname: `localhost` (for development)
5. Add production domain when deploying

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Admin Account**: Change default admin credentials in production
3. **Permissions**: Review and restrict permissions as needed
4. **HTTPS**: Always use HTTPS in production

## Next Steps

Once your Appwrite backend is configured:

1. Test all functionality (registration, login, reports, admin dashboard)
2. Consider implementing real-time subscriptions for live updates
3. Set up backup strategies for your data
4. Configure monitoring and logging
5. Plan for production deployment

Your Appwrite backend is now ready to use with your IssueTrack Pro application!
