import { account, databases, storage, appwriteConfig, ID } from './appwrite';
import { Query } from 'appwrite';

// User related functions
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// PDF Library functions
export const uploadPDF = async (file) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    
    console.log("Starting PDF upload with file:", file.name);
    
    // Simply upload the file to storage
    const fileUpload = await storage.createFile(
      "6848ae770021afb8740c", // Hardcoded bucket ID
      ID.unique(),
      file
    );
    
    console.log("File uploaded successfully:", fileUpload);
    
    return fileUpload;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

export const getUserPDFs = async () => {
  try {
    // Simply list all files in the bucket
    const response = await storage.listFiles(
      "6848ae770021afb8740c" // Hardcoded bucket ID
    );
    
    console.log("PDF files fetched:", response.files);
    
    return response.files;
  } catch (error) {
    console.error("Error getting PDFs:", error);
    return [];
  }
};

export const deletePDF = async (fileId) => {
  try {
    // Simply delete the file from storage
    await storage.deleteFile(
      "6848ae770021afb8740c", // Hardcoded bucket ID
      fileId
    );
    
    return true;
  } catch (error) {
    console.error("Error deleting PDF:", error);
    throw error;
  }
};

// Establishments and Modules functions
export const createEstablishment = async (name) => {
  try {
    const user = await getCurrentUser();
    
    const establishment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.establishmentsCollectionId,
      ID.unique(),
      {
        userId: user.$id,
        name: name
      }
    );
    
    return establishment;
  } catch (error) {
    console.error("Error creating establishment:", error);
    throw error;
  }
};

export const getUserEstablishments = async () => {
  try {
    const user = await getCurrentUser();
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.establishmentsCollectionId,
      [
        Query.equal('userId', user.$id)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error("Error getting user establishments:", error);
    return [];
  }
};

export const createModule = async (name, type, description, establishmentId) => {
  try {
    const user = await getCurrentUser();
    
    const module = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      ID.unique(),
      {
        userId: user.$id,
        name: name,
        type: type,
        description: description,
        establishmentId: establishmentId,
        qcmCount: 0,
        completedQcms: 0
      }
    );
    
    return module;
  } catch (error) {
    console.error("Error creating module:", error);
    throw error;
  }
};

export const getUserModules = async (establishmentId = null) => {
  try {
    const user = await getCurrentUser();
    
    let queries = [Query.equal('userId', user.$id)];
    
    if (establishmentId) {
      queries.push(Query.equal('establishmentId', establishmentId));
    }
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      queries
    );
    
    return response.documents;
  } catch (error) {
    console.error("Error getting user modules:", error);
    return [];
  }
};

export const updateModule = async (moduleId, data) => {
  try {
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      moduleId,
      data
    );
    
    return response;
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

export const deleteModule = async (moduleId) => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      moduleId
    );
    
    return true;
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};

export const deleteEstablishment = async (establishmentId) => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.establishmentsCollectionId,
      establishmentId
    );
    
    return true;
  } catch (error) {
    console.error("Error deleting establishment:", error);
    throw error;
  }
};

export const updateEstablishment = async (establishmentId, data) => {
  try {
    const updatedEstablishment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.establishmentsCollectionId,
      establishmentId,
      data
    );
    
    return updatedEstablishment;
  } catch (error) {
    console.error("Error updating establishment:", error);
    throw error;
  }
};

// QCM functions
export const saveQCM = async (moduleId, qcmName, qcmData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    
    // Validate input
    if (!moduleId || !qcmName || !qcmData || !qcmData.questions) {
      throw new Error("Missing required QCM data");
    }
    
    // Extract question components into separate arrays
    const questionText = [];
    const questionOptions = [];
    const questionAnswers = [];
    const questionCode = [];
    
    qcmData.questions.forEach(q => {
      questionText.push(q.question || "");
      questionOptions.push(JSON.stringify(q.options || []));
      questionAnswers.push(q.answer || "");
      questionCode.push(q.code || "");
    });
    
    // Create QCM document with the new structure
    const qcm = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.qcmsCollectionId,
      ID.unique(),
      {
        userId: user.$id,
        moduleId: moduleId,
        name: qcmName,
        questionText: questionText,
        questionOptions: questionOptions,
        questionAnswers: questionAnswers,
        questionCode: questionCode,
        createdAt: new Date().toISOString()
      }
    );
    
    // Update module QCM count
    const module = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      moduleId
    );
    
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      moduleId,
      {
        qcmCount: (module.qcmCount || 0) + 1
      }
    );
    
    return qcm;
  } catch (error) {
    console.error("Error saving QCM:", error);
    throw error;
  }
};

export const getModuleQCMs = async (moduleId) => {
  try {
    if (!moduleId) throw new Error("Module ID is required");
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.qcmsCollectionId,
      [
        Query.equal('moduleId', moduleId)
      ]
    );
    
    // Convert the array-based structure back to question objects
    const qcms = response.documents.map(doc => {
      // Create a copy of the document
      const processedDoc = { ...doc };
      
      // Reconstruct questions array
      const questions = [];
      
      // Make sure all arrays exist and have the same length
      const length = Math.min(
        doc.questionText?.length || 0,
        doc.questionOptions?.length || 0,
        doc.questionAnswers?.length || 0,
        doc.questionCode?.length || 0
      );
      
      for (let i = 0; i < length; i++) {
        let options = [];
        try {
          options = JSON.parse(doc.questionOptions[i]);
        } catch (e) {
          console.error("Error parsing options:", e);
        }
        
        questions.push({
          question: doc.questionText[i] || "",
          options: Array.isArray(options) ? options : [],
          answer: doc.questionAnswers[i] || "",
          code: doc.questionCode[i] || null
        });
      }
      
      processedDoc.questions = questions;
      
      return processedDoc;
    });
    
    return qcms;
  } catch (error) {
    console.error("Error getting module QCMs:", error);
    return [];
  }
};

export const deleteQCM = async (qcmId) => {
  try {
    const qcm = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.qcmsCollectionId,
      qcmId
    );
    
    // Delete QCM document
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.qcmsCollectionId,
      qcmId
    );
    
    // Update module QCM count
    const module = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      qcm.moduleId
    );
    
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.modulesCollectionId,
      qcm.moduleId,
      {
        qcmCount: Math.max((module.qcmCount || 0) - 1, 0)
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error deleting QCM:", error);
    throw error;
  }
};

export const updateQCM = async (qcmId, data) => {
  try {
    const updatedQCM = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.qcmsCollectionId,
      qcmId,
      data
    );
    
    return updatedQCM;
  } catch (error) {
    console.error("Error updating QCM:", error);
    throw error;
  }
};

export const updateQCMScore = async (qcmId, score) => {
  try {
    const updatedQCM = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.qcmsCollectionId,
      qcmId,
      {
        score: score
      }
    );
    
    return updatedQCM;
  } catch (error) {
    console.error("Error updating QCM score:", error);
    throw error;
  }
};

// Time tracking functions
export const trackModuleTime = async (moduleId, minutes) => {
  try {
    const user = await getCurrentUser();
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
    // Check if there's already a time tracking record for this module and date
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.timeTrackingCollectionId,
      [
        Query.equal('userId', user.$id),
        Query.equal('moduleId', moduleId),
        Query.equal('date', date)
      ]
    );
    
    if (response.documents.length > 0) {
      // Update existing record
      const record = response.documents[0];
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.timeTrackingCollectionId,
        record.$id,
        {
          minutes: record.minutes + minutes
        }
      );
    } else {
      // Create new record
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.timeTrackingCollectionId,
        ID.unique(),
        {
          userId: user.$id,
          moduleId: moduleId,
          date: date,
          minutes: minutes
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error tracking module time:", error);
    throw error;
  }
};

export const getModuleTimeTracking = async (moduleId) => {
  try {
    const user = await getCurrentUser();
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.timeTrackingCollectionId,
      [
        Query.equal('userId', user.$id),
        Query.equal('moduleId', moduleId)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error("Error getting module time tracking:", error);
    return [];
  }
};

export const getTotalTimeSpent = async () => {
  try {
    const user = await getCurrentUser();
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.timeTrackingCollectionId,
      [
        Query.equal('userId', user.$id)
      ]
    );
    
    // Calculate total minutes
    const totalMinutes = response.documents.reduce((total, record) => {
      return total + record.minutes;
    }, 0);
    
    return totalMinutes;
  } catch (error) {
    console.error("Error getting total time spent:", error);
    return 0;
  }
}; 