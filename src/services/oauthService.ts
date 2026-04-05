// OAuth Service for Google and Apple Sign-In
// Handles real OAuth flows with permission requests

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

interface AppleUser {
  id: string;
  name?: string;
  email: string;
  email_verified: boolean;
}

interface OAuthResponse {
  success: boolean;
  source: 'google' | 'apple';
  user: GoogleUser | AppleUser;
  token?: string;
  message?: string;
}

interface OAuthError {
  success: false;
  error: string;
  details?: string;
}

// Demo user consistent across sessions
const DEMO_GOOGLE_USER = {
  id: 'demo_google_user_123',
  name: 'Demo User (Google)',
  email: 'demo@gmail.com',
  picture: 'https://lh3.googleusercontent.com/a/default-user-avatar',
  email_verified: true,
};

const DEMO_APPLE_USER = {
  id: 'demo_apple_user_123',
  name: 'Demo User (Apple)',
  email: 'demo@icloud.com',
  email_verified: true,
};

/** Global variable to store Google Sign-In callback result */
let googleSignInResult: any = null;

/**
 * Wait for Google Sign-In library to load
 */
const waitForGoogleAPI = (maxAttempts: number = 50): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkGoogle = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(checkGoogle);
        console.log('[OAuth] Google Sign-In library loaded successfully');
        resolve();
      } else if (attempts++ > maxAttempts) {
        clearInterval(checkGoogle);
        reject(new Error('Google Sign-In library failed to load after 5 seconds'));
      }
    }, 100);
  });
};

/**
 * Trigger Google Sign-In with permission request
 * Uses popup flow with robust error handling for all browsers
 * Requests email, name, and profile picture
 */
export const signInWithGoogle = (): Promise<OAuthResponse | OAuthError> => {
  return new Promise(async (resolve) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Check if credentials are placeholder values
    if (!clientId || clientId.includes('YOUR_') || clientId.includes('_HERE')) {
      const message = '[OAuth] Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env and reload.';
      console.warn(message);
      resolve({
        success: false,
        error: message,
      });
      return;
    }

    try {
      // Wait for Google library to load
      await waitForGoogleAPI();
    } catch (err) {
      console.error('[OAuth] Google library load failed:', err);
      resolve({
        success: false,
        error: 'Failed to load Google Sign-In',
        details: err instanceof Error ? err.message : 'Google library did not load in time'
      });
      return;
    }

    // Access Google Sign-In
    const googleSignIn = (window as any).google?.accounts?.id;

    if (!googleSignIn) {
      resolve({
        success: false,
        error: 'Google Sign-In not available',
      });
      return;
    }

    console.log('[OAuth] Initializing Google Sign-In...');

    // Reset result
    googleSignInResult = null;

    // Initialize sign-in with callback
    googleSignIn.initialize({
      client_id: clientId,
      callback: (response: any) => {
        console.log('[OAuth] Google callback fired');
        googleSignInResult = response;

        if (response.credential) {
          console.log('[OAuth] Google credential received, parsing JWT...');
          try {
            // Decode JWT token (Google sends JWT in credential)
            const base64Url = response.credential.split('.')[1];
            if (!base64Url) {
              throw new Error('Invalid JWT format: missing payload');
            }

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );

            const userData = JSON.parse(jsonPayload);

            console.log('[OAuth] Google JWT decoded successfully:', {
              email: userData.email,
              name: userData.name,
              id: userData.sub
            });

            resolve({
              success: true,
              source: 'google',
              user: {
                id: userData.sub || userData.email,
                name: userData.name || 'Google User',
                email: userData.email,
                picture: userData.picture || '',
                email_verified: userData.email_verified || false,
              },
              token: response.credential,
            });
          } catch (error) {
            console.error('[OAuth] Failed to parse Google user data:', error);
            resolve({
              success: false,
              error: 'Failed to parse Google user data',
              details: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          console.log('[OAuth] Google sign-in cancelled or no credential');
          resolve({
            success: false,
            error: 'Google sign-in cancelled or failed',
          });
        }
      },
    });

    // Render button (if present)
    const googleButton = document.getElementById('google-signin-button');
    if (googleButton && (googleSignIn as any).renderButton) {
      (googleSignIn as any).renderButton(googleButton, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: '100%',
      });
    }

    console.log('[OAuth] Attempting Google sign-in...');

    try {
      // Use One Tap prompt (recommended for Google Identity Services)
      (googleSignIn as any).prompt((notification: any) => {
        const isDisplayed = notification.isDisplayed ? notification.isDisplayed() : false;
        const isNotDisplayed = notification.isNotDisplayed ? notification.isNotDisplayed() : false;

        console.log('[OAuth] Prompt result:', { isDisplayed, isNotDisplayed });

        if (isNotDisplayed) {
          console.warn('[OAuth] Prompt not displayed - popup may be blocked or dismissed');
          resolve({
            success: false,
            error: 'Google sign-in prompt did not display. Please allow popups and try again.',
          });
        }
      });
    } catch (promptError: any) {
      console.error('[OAuth] Google prompt call failed:', promptError);
      resolve({
        success: false,
        error: 'Google sign-in failed to start. Please allow popups and refresh.',
      });
    }

    // Fallback timeout
    setTimeout(() => {
      if (!googleSignInResult) {
        console.warn('[OAuth] Sign-in timed out');
        resolve({
          success: false,
          error: 'Sign-in timed out. Please try again.',
        });
      }
    }, 30000);
  });
};
const waitForAppleAPI = (maxAttempts: number = 50): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkApple = setInterval(() => {
      if ((window as any).AppleID) {
        clearInterval(checkApple);
        console.log('[OAuth] Apple Sign-In library loaded successfully');
        resolve();
      } else if (attempts++ > maxAttempts) {
        clearInterval(checkApple);
        reject(new Error('Apple Sign-In library failed to load after 5 seconds'));
      }
    }, 100);
  });
};

/**
 * Trigger Apple Sign-In with permission request
 * Requests email and full name
 */
export const signInWithApple = (): Promise<OAuthResponse | OAuthError> => {
  return new Promise(async (resolve) => {
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    
    // Check if credentials are placeholder values
    if (!clientId || clientId.includes('YOUR_') || clientId.includes('_HERE')) {
      const message = '[OAuth] Apple Sign-In not configured. Set VITE_APPLE_CLIENT_ID, VITE_APPLE_TEAM_ID, VITE_APPLE_KEY_ID, and APPLE_PRIVATE_KEY in .env.';
      console.warn(message);
      resolve({
        success: false,
        error: message,
      });
      return;
    }

    try {
      // Wait for Apple library to load
      await waitForAppleAPI();
    } catch (err) {
      console.error('[OAuth] Apple library load failed:', err);
      resolve({
        success: false,
        error: 'Failed to load Apple Sign-In',
        details: err instanceof Error ? err.message : 'Apple library did not load in time'
      });
      return;
    }

    try {
      console.log('[OAuth] Initializing Apple Sign-In...');
      initializeAppleSignIn(resolve);
    } catch (error) {
      console.error('[OAuth] Failed to initialize Apple Sign-In:', error);
      resolve({
        success: false,
        error: 'Failed to initialize Apple Sign-In',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

/**
 * Initialize Apple Sign-In configuration
 */
const initializeAppleSignIn = (resolve: any) => {
  try {
    const AppleID = (window as any).AppleID;
    
    if (!AppleID || !AppleID.auth) {
      throw new Error('AppleID not available');
    }

    AppleID.auth.init({
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
      teamId: import.meta.env.VITE_APPLE_TEAM_ID,
      keyId: import.meta.env.VITE_APPLE_KEY_ID,
      redirectURI: window.location.origin + '/auth/apple/callback',
      scope: 'email name',
      redirectMethod: 'form',
      usePopup: true,
    });

    console.log('[OAuth] Triggering Apple sign-in...');

    // Trigger sign-in
    AppleID.auth.signIn()
      .then((response: any) => {
        console.log('[OAuth] Apple callback received');
        
        if (response && response.authorization && response.authorization.id_token) {
          console.log('[OAuth] Apple credential received, parsing JWT...');
          // Parse ID token JWT
          try {
            const base64Url = response.authorization.id_token.split('.')[1];
            if (!base64Url) {
              throw new Error('Invalid JWT format: missing payload');
            }
            
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );

            const userData = JSON.parse(jsonPayload);

            // Apple provides email but name comes separately
            const firstName = response.user?.name?.firstName || '';
            const lastName = response.user?.name?.lastName || '';
            const name = (firstName + ' ' + lastName).trim() || userData.name || 'Apple User';

            console.log('[OAuth] Apple JWT decoded successfully:', {
              email: userData.email,
              name: name,
              id: userData.sub
            });

            resolve({
              success: true,
              source: 'apple',
              user: {
                id: userData.sub || userData.email,
                name: name,
                email: userData.email,
                email_verified: userData.email_verified || false,
              },
              token: response.authorization.id_token,
            });
          } catch (error) {
            console.error('[OAuth] Failed to parse Apple user data:', error);
            resolve({
              success: false,
              error: 'Failed to parse Apple user data',
              details: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          console.log('[OAuth] Apple sign-in cancelled or no credential');
          resolve({
            success: false,
            error: 'Apple sign-in cancelled or failed',
          });
        }
      })
      .catch((error: any) => {
        console.error('[OAuth] Apple sign-in error:', error);
        resolve({
          success: false,
          error: 'Apple sign-in error',
          details: error?.message || 'Unknown error',
        });
      });
  } catch (error) {
    console.error('[OAuth] Failed to initialize Apple Sign-In:', error);
    resolve({
      success: false,
      error: 'Failed to initialize Apple Sign-In',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Send OAuth token to backend for verification and user creation
 */
export const verifyOAuthToken = async (
  provider: 'google' | 'apple',
  token: string,
  userData: GoogleUser | AppleUser
): Promise<any> => {
  try {
const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: provider,
        token,
        userData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `${provider} verification failed`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
