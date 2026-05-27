
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * @returns {Object|null} - Firebase Admin instance or null if not configured
 */
const initializeFirebase = () => {
  try {
    if (admin.apps.length > 0) {
      return admin.app();
    }

    let serviceAccount = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        path.join(process.cwd(), 'firebase-service-account.json');

      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
      }
    }

    if (serviceAccount) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully');
      return firebaseApp;
    } else {
      console.warn('⚠️ Firebase credentials not found. Push notifications will be disabled.');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    return null;
  }
};

module.exports = {
  admin,
  initializeFirebase,
};
