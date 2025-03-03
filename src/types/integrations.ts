
export interface GoogleIntegration {
  id: string;
  user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scopes: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthState {
  id: string;
  state: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}
