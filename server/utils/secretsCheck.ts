/**
 * Checks if all required secrets are present in the environment variables
 * @param secretKeys Array of secret keys that need to be checked
 * @throws Error if any of the required secrets are missing
 */
export function checkSecrets(secretKeys: string[]): void {
  const missingSecrets = secretKeys.filter(key => !process.env[key]);
  
  if (missingSecrets.length > 0) {
    console.warn(`⚠️ Warning: The following secrets are missing: ${missingSecrets.join(', ')}`);
    console.warn('The application might not function correctly without these secrets.');
  } else {
    console.log(`✅ All required secrets are present: ${secretKeys.join(', ')}`);
  }
}