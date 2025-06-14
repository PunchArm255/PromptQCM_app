import { Client, Databases, Account, Storage, ID } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67fd12b0003328d94b7d"); // my project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID }; // Export ID for use in other files

// Database and collection IDs
export const appwriteConfig = {
  databaseId: "6848a63f002c874cd19a",
  modulesCollectionId: "6848a66b001d042348f4",
  qcmsCollectionId: "6848a9cb0002191a8eb3",
  establishmentsCollectionId: "6848ace100344d1581ae",
  timeTrackingCollectionId: "6848adfe001a163abb87",
  pdfBucketId: "6848ae770021afb8740c",
  userProfilesCollectionId: "684d0c1d00296398f1cd", // Updated collection ID
  profileImagesBucketId: "684d0c84000edec70ed0" // Updated bucket ID
};

// OAuth providers
export const oAuthProviders = {
  google: "google",
  apple: "apple"
};

// User profile functions
export const getUserProfile = async (userId) => {
  try {
    const profile = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userProfilesCollectionId,
      userId
    );
    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (userId, data) => {
  try {
    const profile = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userProfilesCollectionId,
      userId,
      data
    );
    return profile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const profile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userProfilesCollectionId,
      userId,
      data
    );
    return profile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Profile image functions
export const uploadProfileImage = async (file) => {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.profileImagesBucketId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

export const getProfileImageUrl = (fileId) => {
  return storage.getFileView(appwriteConfig.profileImagesBucketId, fileId);
};

export const deleteProfileImage = async (fileId) => {
  try {
    await storage.deleteFile(appwriteConfig.profileImagesBucketId, fileId);
    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw error;
  }
};

// Authentication functions
export const getCurrentUser = async () => {
  try {
    console.log("Getting current user...");
    const user = await account.get();
    console.log("User found:", user);
    
    if (user) {
      // Try to get the user profile with additional information
      try {
        console.log("Fetching user profile for ID:", user.$id);
        const profile = await getUserProfile(user.$id);
        console.log("User profile:", profile);
        
        if (profile) {
          // If profile exists, merge with user data
          console.log("Merging user data with profile");
          return { ...user, profile };
        }
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Continue with just the user data if profile fetch fails
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
