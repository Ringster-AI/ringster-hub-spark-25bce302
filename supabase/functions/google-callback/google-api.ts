
import { GoogleTokenResponse, GoogleUserInfo } from "../_shared/types.ts";

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string,
  requestId: string
): Promise<GoogleTokenResponse> {
  // IMPORTANT: Use URLSearchParams for proper x-www-form-urlencoded format
  const tokenParams = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier, // Add PKCE code verifier
  });
  
  console.log(`[${requestId}] Token request parameters:`, 
    Object.fromEntries([...tokenParams.entries()].filter(([key]) => key !== 'client_secret')));
  console.log(`[${requestId}] Redirect URI: ${redirectUri}`);
  
  // Add timeout protection
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  
  try {
    console.log(`[${requestId}] Making token exchange request`);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: tokenParams,
      signal: controller.signal
    });
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);

    console.log(`[${requestId}] Token exchange response status: ${tokenResponse.status}`);
    
    const tokenResponseText = await tokenResponse.text();
    console.log(`[${requestId}] Raw token response (first 100 chars): ${tokenResponseText.substring(0, 100)}...`);
    
    let tokenData: GoogleTokenResponse;
    try {
      tokenData = JSON.parse(tokenResponseText);
      console.log(`[${requestId}] Token data parsed successfully`);
    } catch (parseError) {
      console.error(`[${requestId}] Error parsing token response:`, parseError);
      throw new Error("Failed to parse token response");
    }
    
    if (!tokenResponse.ok) {
      console.error(`[${requestId}] Error exchanging code for tokens:`, tokenData);
      throw new Error(tokenData.error || "Token exchange error");
    }

    return tokenData;
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      console.error(`[${requestId}] Token request timed out`);
      throw new Error("Token request timed out");
    }
    console.error(`[${requestId}] Fetch error in token exchange:`, fetchError);
    throw fetchError;
  }
}

/**
 * Get user information from Google API
 */
export async function fetchUserInfo(accessToken: string, requestId: string): Promise<GoogleUserInfo> {
  console.log(`[${requestId}] Requesting user info from Google...`);
  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(`[${requestId}] User info response status: ${userInfoResponse.status}`);
  
  const userInfoText = await userInfoResponse.text();
  console.log(`[${requestId}] Raw user info response: ${userInfoText}`);
  
  let userInfo: GoogleUserInfo;
  try {
    userInfo = JSON.parse(userInfoText);
    console.log(`[${requestId}] User info parsed successfully: ${JSON.stringify({
      email: userInfo.email,
      id: userInfo.id,
      verified_email: userInfo.verified_email
    })}`);
  } catch (parseError) {
    console.error(`[${requestId}] Error parsing user info response:`, parseError);
    throw new Error("Failed to parse user info");
  }

  if (!userInfoResponse.ok) {
    console.error(`[${requestId}] Error getting user info:`, userInfo);
    throw new Error("Failed to get user info");
  }

  return userInfo;
}

/**
 * Store Google tokens using the token storage function
 */
export async function storeTokens(
  userId: string,
  userEmail: string,
  accessToken: string,
  refreshToken: string | undefined,
  expiresAt: string,
  scopes: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  requestId: string
) {
  console.log(`[${requestId}] Storing tokens securely for user ${userId}`);
  
  const storeResponse = await fetch(`${supabaseUrl}/functions/v1/store-google-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({
      userId,
      email: userEmail,
      accessToken,
      refreshToken: refreshToken || '',
      expiresAt,
      scopes
    })
  });
  
  const storeResponseText = await storeResponse.text();
  console.log(`[${requestId}] Store tokens response status: ${storeResponse.status}`);
  console.log(`[${requestId}] Store tokens response: ${storeResponseText}`);
  
  let storeResult;
  try {
    storeResult = JSON.parse(storeResponseText);
  } catch (parseError) {
    console.error(`[${requestId}] Error parsing store response:`, parseError, storeResponseText);
    throw new Error("Failed to parse token storage response");
  }
  
  if (!storeResponse.ok) {
    console.error(`[${requestId}] Error storing tokens:`, storeResult);
    throw new Error("Failed to store tokens");
  }
  
  console.log(`[${requestId}] Tokens stored successfully:`, storeResult);
  return storeResult;
}
