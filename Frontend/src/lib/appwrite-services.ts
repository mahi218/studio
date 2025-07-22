import { 
  Client as NodeClient, 
  Account as NodeAccount, 
  Databases as NodeDatabases, 
  Storage as NodeStorage, 
  ID, 
  Query,
  Users as NodeUsers
} from 'node-appwrite';
import { User, Report, ReportStatus, EmployeeType } from './types';

// Server-side client configuration
const serverClient = new NodeClient();

// Check if we have valid configuration
const hasValidConfig = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && 
                      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== '' &&
                      !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID.includes('temp') &&
                      process.env.APPWRITE_API_KEY && 
                      process.env.APPWRITE_API_KEY !== 'temp_api_key' &&
                      process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID &&
                      process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID !== 'temp_collection_id';
// Temporarily allow development mode without full Appwrite setup
// const hasValidConfig = false; // Set to false to use fallback mode during development

if (hasValidConfig) {
  serverClient
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || ''); // Server-side API key
}

// Initialize server services
const serverAccount = new NodeAccount(serverClient);
const serverDatabases = new NodeDatabases(serverClient);
const serverStorage = new NodeStorage(serverClient);
const serverUsers = new NodeUsers(serverClient);

// Database and Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
const REPORTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REPORTS_COLLECTION_ID || '';
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '';

// Admin credentials
const ADMIN_EMAIL = process.env.APPWRITE_ADMIN_EMAIL || 'admin@issuetrack.com';
const ADMIN_PASSWORD = process.env.APPWRITE_ADMIN_PASSWORD || 'admin123456';

// --- AUTH SERVICES ---

export class AppwriteAuthService {
  static async registerEmployee(userData: {
    name: string;
    email: string;
    password: string;
    employeeCode: string;
  }) {
    // Fallback to in-memory storage if Appwrite not configured
    if (!hasValidConfig) {
      console.log('Using fallback registration (Appwrite not configured)');
      return { success: true, user: { id: 'temp', ...userData, role: 'employee' } };
    }

    try {
      // Create account in Appwrite Auth using server SDK
      const authUser = await serverUsers.create(
        ID.unique(),
        userData.email,
        undefined, // phone number (optional)
        userData.password,
        userData.name
      );

      // Create user document in database
      const userDoc = await serverDatabases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          authID: authUser.$id,
          name: userData.name,
          email: userData.email,
          employeeCode: userData.employeeCode,
          role: 'employee',
          createdAt: new Date().toISOString(),
        }
      );

      return { success: true, user: userDoc };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { error: error.message || 'Registration failed' };
    }
  }

  static async loginEmployee(email: string, password: string) {
    // Fallback to in-memory storage if Appwrite not configured
    if (!hasValidConfig) {
      console.log('Using fallback login (Appwrite not configured)');
      if (email === 'test@test.com' && password === 'password') {
        return { 
          success: true, 
          user: {
            id: 'temp-user',
            authId: 'temp-auth',
            name: 'Test User',
            email: email,
            employeeCode: 'TEST001',
            role: 'employee'
          }
        };
      }
      return { error: 'Invalid credentials (use test@test.com / password)' };
    }

    try {
      // For server-side authentication, we'll use a different approach
      // First, get user document from database using email
      const userDocs = await serverDatabases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', email)]
      );

      if (userDocs.documents.length === 0) {
        return { error: 'User not found' };
      }

      const userDoc = userDocs.documents[0];
      
      // Verify user exists in auth system
      try {
        await serverUsers.get(userDoc.authID);
      } catch (error) {
        return { error: 'Invalid credentials' };
      }

      return { 
        success: true, 
        user: {
          id: userDoc.$id,
          authId: userDoc.authID,
          name: userDoc.name,
          email: userDoc.email,
          employeeCode: userDoc.employeeCode,
          role: userDoc.role
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message || 'Login failed' };
    }
  }

  static async loginAdmin(passcode: string) {
    try {
      const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
      
      if (passcode !== ADMIN_PASSCODE) {
        return { error: 'Invalid passcode' };
      }

      // Fallback to in-memory storage if Appwrite not configured
      if (!hasValidConfig) {
        console.log('Using fallback admin login (Appwrite not configured)');
        return {
          success: true,
          user: {
            id: 'admin-temp',
            authId: 'admin-auth',
            name: 'Admin',
            email: ADMIN_EMAIL,
            employeeCode: 'ADMIN',
            role: 'admin'
          }
        };
      }

      // Check if admin user document exists, create if not
      let userDocs = await serverDatabases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', ADMIN_EMAIL)]
      );

      let adminUser;
      if (userDocs.documents.length === 0) {
        // Create admin user in auth system first
        let authUser;
        try {
          authUser = await serverUsers.create(
            ID.unique(),
            ADMIN_EMAIL,
            undefined,
            ADMIN_PASSWORD,
            'Admin'
          );
        } catch (error: any) {
          // If user already exists, get the user
          const existingUsers = await serverUsers.list([Query.equal('email', ADMIN_EMAIL)]);
          if (existingUsers.users.length > 0) {
            authUser = existingUsers.users[0];
          } else {
            throw error;
          }
        }

        adminUser = await serverDatabases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            authID: authUser.$id,
            name: 'Admin',
            email: ADMIN_EMAIL,
            employeeCode: 'ADMIN',
            role: 'admin',
            createdAt: new Date().toISOString(),
          }
        );
      } else {
        adminUser = userDocs.documents[0];
      }

      return { 
        success: true, 
        user: {
          id: adminUser.$id,
          authId: adminUser.authID,
          name: adminUser.name,
          email: adminUser.email,
          employeeCode: adminUser.employeeCode,
          role: adminUser.role
        }
      };
    } catch (error: any) {
      console.error('Admin login error:', error);
      return { error: error.message || 'Admin login failed' };
    }
  }

  static async logout() {
    try {
      // For server-side, we'll handle logout in the actions
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: error.message || 'Logout failed' };
    }
  }

  static async getCurrentUser() {
    try {
      // This will be handled by the session management in actions
      return null;
    } catch (error) {
      return null;
    }
  }
}

// --- REPORT SERVICES ---

export class AppwriteReportService {
  static async createReport(reportData: {
    employeeName: string;
    employeeCode: string;
    employeeType: EmployeeType;
    department: string;
    description: string;
    image: string;
    submittedBy: string;
  }) {
    try {
      // Upload image to storage if it's a data URI
      let imageUrl = reportData.image;
      if (reportData.image.startsWith('data:')) {
        const imageFile = AppwriteReportService.dataURItoFile(reportData.image, 'report-image.jpg');
        const uploadedFile = await serverStorage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          imageFile
        );
        imageUrl = serverStorage.getFileView(STORAGE_BUCKET_ID, uploadedFile.$id).toString();
      }

      const report = await serverDatabases.createDocument(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        ID.unique(),
        {
          employeeName: reportData.employeeName,
          employeeCode: reportData.employeeCode,
          employeeType: reportData.employeeType,
          department: reportData.department,
          description: reportData.description,
          attachments: imageUrl || '',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reportedBy: reportData.submittedBy,
        }
      );

      return { success: true, report };
    } catch (error: any) {
      console.error('Create report error:', error);
      return { error: error.message || 'Failed to create report' };
    }
  }

  static async getMyReports(userId: string) {
    console.log('AppwriteReportService.getMyReports called with userId:', userId);
    
    if (!userId || userId.trim() === '') {
      console.log('getMyReports - empty userId provided');
      return [];
    }
    
    try {
      const reports = await serverDatabases.listDocuments(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        [
          Query.equal('reportedBy', userId),
          Query.orderDesc('createdAt')
        ]
      );

      return reports.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        priority: doc.priority,
        category: doc.category,
        department: doc.department,
        description: doc.description,
        location: doc.location || '',
        attachments: doc.attachments || '',
        status: doc.status,
        submittedAt: new Date(doc.createdAt),
        submittedBy: doc.reportedBy,
        assignedTo: doc.assignedTo || '',
      }));
    } catch (error: any) {
      console.error('Get my reports error:', error);
      return [];
    }
  }

  static async getAllReports() {
    try {
      const reports = await serverDatabases.listDocuments(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        [Query.orderDesc('createdAt')]
      );

      return reports.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        priority: doc.priority,
        category: doc.category,
        department: doc.department,
        description: doc.description,
        location: doc.location || '',
        attachments: doc.attachments || '',
        status: doc.status,
        submittedAt: new Date(doc.createdAt),
        submittedBy: doc.reportedBy,
        assignedTo: doc.assignedTo || '',
      }));
    } catch (error: any) {
      console.error('Get all reports error:', error);
      return [];
    }
  }

  static async replyToReport(reportId: string, reply: string, status: ReportStatus) {
    try {
      const updatedReport = await serverDatabases.updateDocument(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        reportId,
        {
          reply,
          status,
          repliedAt: new Date().toISOString(),
        }
      );

      return { success: true, report: updatedReport };
    } catch (error: any) {
      console.error('Reply to report error:', error);
      return { error: error.message || 'Failed to reply to report' };
    }
  }

  // Helper function to convert data URI to File
  static dataURItoFile(dataURI: string, filename: string): File {
    const arr = dataURI.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}

// --- STORAGE SERVICES ---

export class AppwriteStorageService {
  static async uploadFile(file: File) {
    try {
      const uploadedFile = await serverStorage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      const fileUrl = serverStorage.getFileView(STORAGE_BUCKET_ID, uploadedFile.$id);
      return { success: true, fileId: uploadedFile.$id, fileUrl: fileUrl.toString() };
    } catch (error: any) {
      console.error('Upload file error:', error);
      return { error: error.message || 'Failed to upload file' };
    }
  }

  static async deleteFile(fileId: string) {
    try {
      await serverStorage.deleteFile(STORAGE_BUCKET_ID, fileId);
      return { success: true };
    } catch (error: any) {
      console.error('Delete file error:', error);
      return { error: error.message || 'Failed to delete file' };
    }
  }
}
