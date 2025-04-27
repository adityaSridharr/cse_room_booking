import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

const firebaseConfig = {
  apiKey: 'AIzaSyDKNA1fbrlBsgURkAFBiCGqqpGv8OGGxbA',
  authDomain: `iit-hyderabad-room-booking.firebaseapp.com`,
  projectId: 'iit-hyderabad-room-booking',
  storageBucket: `iit-hyderabad-room-booking.appspot.com`,
  appId: '1:330574353126:web:15f24052da7b3293942127',
};

// Print all the configuration variables
console.log("Firebase Configuration Variables:");
console.log("API Key:", firebaseConfig.apiKey);
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("Project ID:", firebaseConfig.projectId);
console.log("Storage Bucket:", firebaseConfig.storageBucket);
console.log("App ID:", firebaseConfig.appId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force Google Auth to select account
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Only allow @iith.ac.in emails
googleProvider.setCustomParameters({
  hd: 'iith.ac.in'
});

export const signInWithGoogle = async () => {
  try {
    // Use redirect method instead of popup for better compatibility with Replit
    return await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Error starting Google sign-in process:", error);
    
    // Check for configuration error
    if (error instanceof Error && 
        error.message.includes("auth/configuration-not-found")) {
      alert("Firebase authentication error: Your current domain is not authorized in Firebase. " +
            "Please add the Replit domain to the authorized domains list in your Firebase console " +
            "under Authentication > Settings.");
    }
    
    throw error;
  }
};

export const getGoogleAuthResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Error processing Google sign-in result:", error);
    
    // Check for configuration error
    if (error instanceof Error) {
      if (error.message.includes("auth/configuration-not-found")) {
        alert("Firebase authentication error: Your current domain is not authorized in Firebase. " +
              "Please add the Replit domain to the authorized domains list in your Firebase console " +
              "under Authentication > Settings.");
      } else if (error.message.includes("auth/popup-closed-by-user") || 
                 error.message.includes("auth/cancelled-popup-request")) {
        // User closed the popup or cancelled - this is expected behavior, no need to alert
        console.log("User cancelled the authentication process");
        return null;
      }
    }
    
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};