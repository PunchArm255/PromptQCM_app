import { Client, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Fixed: use actual Appwrite endpoint
  .setProject('67fd12b0003328d94b7d');

const databases = new Databases(client);
const storage = new Storage(client);

// Collection and Bucket IDs (using provided values)
const DB_ID = '6848a63f002c874cd19a';
const MODULES_COLLECTION = '6848a66b001d042348f4';
const QCMS_COLLECTION = '6848a9cb0002191a8eb3';
const ESTABLISHMENTS_COLLECTION = '6848ace100344d1581ae';
const SAVED_QCMS_COLLECTION = '6848ad860021a28777de';
const TIME_REPORTS_COLLECTION = '6848adfe001a163abb87';
const PDF_BUCKET = '6848ae770021afb8740c';

// --- Modules ---
export const createModule = async (data) => {
  return databases.createDocument(DB_ID, MODULES_COLLECTION, ID.unique(), data);
};

export const getModules = async () => {
  return databases.listDocuments(DB_ID, MODULES_COLLECTION);
};

export const updateModule = async (id, data) => {
  return databases.updateDocument(DB_ID, MODULES_COLLECTION, id, data);
};

export const deleteModule = async (id) => {
  return databases.deleteDocument(DB_ID, MODULES_COLLECTION, id);
};

// --- QCMs ---
export const createQCM = async (data) => {
  return databases.createDocument(DB_ID, QCMS_COLLECTION, ID.unique(), data);
};

export const getQCMs = async (queries = []) => {
  return databases.listDocuments(DB_ID, QCMS_COLLECTION, queries);
};

// --- Establishments ---
export const createEstablishment = async (data) => {
  return databases.createDocument(DB_ID, ESTABLISHMENTS_COLLECTION, ID.unique(), data);
};

export const getEstablishments = async () => {
  return databases.listDocuments(DB_ID, ESTABLISHMENTS_COLLECTION);
};

// --- Saved QCMs ---
export const saveQCM = async (data) => {
  return databases.createDocument(DB_ID, SAVED_QCMS_COLLECTION, ID.unique(), data);
};

export const getSavedQCMs = async (userId) => {
  return databases.listDocuments(DB_ID, SAVED_QCMS_COLLECTION, [
    Query.equal('userId', userId),
  ]);
};

// --- Time Reports ---
export const saveTimeReport = async (data) => {
  return databases.createDocument(DB_ID, TIME_REPORTS_COLLECTION, ID.unique(), data);
};

export const getTimeReports = async (userId) => {
  return databases.listDocuments(DB_ID, TIME_REPORTS_COLLECTION, [
    Query.equal('userId', userId),
  ]);
};

// --- PDF Uploads ---
export const uploadPDF = async (file) => {
  return storage.createFile(PDF_BUCKET, ID.unique(), file);
};

export const listPDFs = async () => {
  return storage.listFiles(PDF_BUCKET);
};

export const getPDFPreview = (fileId) => {
  return storage.getFilePreview(PDF_BUCKET, fileId);
};

// ... Add more as needed for your app ... 