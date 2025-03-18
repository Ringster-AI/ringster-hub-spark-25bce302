
// Common types used across multiple functions

export interface OAuthStateData {
  state: string;
  code_verifier: string;
  return_url: string;
  user_id: string | null;
  created_at: string;
  expires_at: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  id_token?: string;
  token_type: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}
