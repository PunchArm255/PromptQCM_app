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
  pdfBucketId: "6848ae770021afb8740c"
};
