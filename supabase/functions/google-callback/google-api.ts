
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string,
  requestId: string
) {
  console.log(`[${requestId}] Exchanging authorization code for tokens`);
  
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const tokenData = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(tokenData).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${requestId}] Token exchange failed:`, response.status, errorText);
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const tokens = await response.json();
  console.log(`[${requestId}] Successfully exchanged code for tokens`);
  return tokens;
}

export async function fetchUserInfo(accessToken: string, requestId: string) {
  console.log(`[${requestId}] Fetching user info from Google`);
  
  const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
  const response = await fetch(userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${requestId}] User info fetch failed:`, response.status, errorText);
    throw new Error(`User info fetch failed: ${response.status} ${errorText}`);
  }

  const userInfo = await response.json();
  console.log(`[${requestId}] Successfully fetched user info`);
  return userInfo;
}
