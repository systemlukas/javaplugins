import { ConnectionProfile } from '../types/ssh';

const PROFILES_STORAGE_KEY = 'sshClientProfiles';

// Helper to generate a simple unique ID. crypto.randomUUID() is preferred for production.
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Retrieves all connection profiles from localStorage.
 * @returns {ConnectionProfile[]} An array of profiles, or an empty array if none are found or on error.
 */
export function getProfiles(): ConnectionProfile[] {
  try {
    const profilesJson = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (profilesJson) {
      const profiles = JSON.parse(profilesJson);
      // Basic validation to ensure it's an array (can be more thorough)
      return Array.isArray(profiles) ? profiles : [];
    }
    return [];
  } catch (error) {
    console.error('Error retrieving profiles from localStorage:', error);
    return []; // Return empty array on error
  }
}

/**
 * Saves the entire list of profiles to localStorage.
 * WARNING: This currently stores passwords in plaintext, which is insecure.
 * This is temporary and will be replaced by a secure storage solution.
 * @param {ConnectionProfile[]} profiles The array of profiles to save.
 */
export function saveProfiles(profiles: ConnectionProfile[]): void {
  try {
    // WARNING: Storing sensitive data like passwords in plaintext in localStorage is insecure.
    // This is a temporary measure for Phase 1 and will be addressed.
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles to localStorage:', error);
  }
}

/**
 * Adds a new connection profile.
 * @param {Omit<ConnectionProfile, 'id'>} profileData The data for the new profile, without an id.
 * @returns {ConnectionProfile} The newly created profile, including its generated id.
 */
export function addProfile(profileData: Omit<ConnectionProfile, 'id'>): ConnectionProfile {
  const profiles = getProfiles();
  const newProfile: ConnectionProfile = {
    ...profileData,
    id: generateId(),
  };
  profiles.push(newProfile);
  saveProfiles(profiles);
  return newProfile;
}

/**
 * Updates an existing connection profile.
 * @param {ConnectionProfile} updatedProfile The profile with updated data.
 * @returns {boolean} True if the profile was found and updated, false otherwise.
 */
export function updateProfile(updatedProfile: ConnectionProfile): boolean {
  const profiles = getProfiles();
  const profileIndex = profiles.findIndex(p => p.id === updatedProfile.id);

  if (profileIndex !== -1) {
    profiles[profileIndex] = updatedProfile;
    saveProfiles(profiles);
    return true;
  }
  return false; // Profile not found
}

/**
 * Deletes a connection profile by its id.
 * @param {string} profileId The id of the profile to delete.
 * @returns {boolean} True if a profile was deleted, false otherwise.
 */
export function deleteProfile(profileId: string): boolean {
  const profiles = getProfiles();
  const initialLength = profiles.length;
  const updatedProfiles = profiles.filter(p => p.id !== profileId);

  if (updatedProfiles.length < initialLength) {
    saveProfiles(updatedProfiles);
    return true; // A profile was deleted
  }
  return false; // No profile found with that id
}

// Security Warning Comment:
// The functions in this service currently store connection profiles, including passwords,
// in plaintext within the browser's localStorage. This is highly insecure and intended
// only as a temporary measure for the initial development phase.
// In a production environment, or even for further development, this approach MUST be
// replaced with a secure storage mechanism. For Electron applications, this typically
// involves using Electron's IPC to store sensitive data in the main process, potentially
// encrypted using Node.js crypto capabilities or electron-store with encryption,
// or by leveraging OS-level secure storage (e.g., keychain on macOS, Credential Manager on Windows).
// DO NOT use this plaintext localStorage approach for any real sensitive data.
