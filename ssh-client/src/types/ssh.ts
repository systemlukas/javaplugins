export interface SSHConnectionParams {
  host: string;
  port: number;
  username: string;
  password?: string; // Password might be optional if using private key auth later
  privateKey?: string; // For key-based authentication
  passphrase?: string; // For private keys that are passphrase-protected
}

export interface ConnectionProfile extends SSHConnectionParams {
  id: string; // Unique identifier for the profile
  name: string; // User-defined name for the profile (e.g., "My Web Server")
}
