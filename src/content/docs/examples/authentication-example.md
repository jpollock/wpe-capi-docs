---
title: Authentication Example
description: A complete example of authenticating with the WP Engine Customer API
---

# Authentication Example

This example demonstrates how to authenticate with the WP Engine Customer API using both OAuth 2.0 and API Keys. We'll show complete code examples in multiple programming languages.

## API Key Authentication

API Key authentication is simpler and ideal for server-to-server integrations or scripts.

### Python Example

```python
import requests

def get_sites_with_api_key(api_key):
    """
    Retrieve a list of sites using API Key authentication
    """
    headers = {
        "Authorization": f"ApiKey {api_key}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        "https://wpengineapi.com/v1/sites",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API request failed: {response.status_code} - {response.text}")

# Usage
if __name__ == "__main__":
    API_KEY = "your_api_key_here"
    
    try:
        sites = get_sites_with_api_key(API_KEY)
        print(f"Found {len(sites['results'])} sites:")
        for site in sites['results']:
            print(f"- {site['name']} ({site['url']})")
    except Exception as e:
        print(f"Error: {e}")
```

### Node.js Example

```javascript
const axios = require('axios');

async function getSitesWithApiKey(apiKey) {
  /**
   * Retrieve a list of sites using API Key authentication
   */
  try {
    const response = await axios.get('https://wpengineapi.com/v1/sites', {
      headers: {
        'Authorization': `ApiKey ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`API request failed: ${error.response ? error.response.status : error.message}`);
  }
}

// Usage
(async () => {
  const API_KEY = 'your_api_key_here';
  
  try {
    const sites = await getSitesWithApiKey(API_KEY);
    console.log(`Found ${sites.results.length} sites:`);
    sites.results.forEach(site => {
      console.log(`- ${site.name} (${site.url})`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
```

### PHP Example

```php
<?php

function getSitesWithApiKey($apiKey) {
    /**
     * Retrieve a list of sites using API Key authentication
     */
    $ch = curl_init('https://wpengineapi.com/v1/sites');
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: ApiKey ' . $apiKey,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($httpCode !== 200) {
        throw new Exception("API request failed: $httpCode - $response");
    }
    
    curl_close($ch);
    return json_decode($response, true);
}

// Usage
$API_KEY = 'your_api_key_here';

try {
    $sites = getSitesWithApiKey($API_KEY);
    echo "Found " . count($sites['results']) . " sites:\n";
    foreach ($sites['results'] as $site) {
        echo "- " . $site['name'] . " (" . $site['url'] . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

## OAuth 2.0 Authentication

OAuth 2.0 is more complex but provides better security and user-specific permissions. This example demonstrates the Authorization Code flow.

### Web Application Example (Python with Flask)

```python
from flask import Flask, request, redirect, session, url_for
import requests
import os
import secrets

app = Flask(__name__)
app.secret_key = os.urandom(24)

# OAuth configuration
CLIENT_ID = "your_client_id_here"
CLIENT_SECRET = "your_client_secret_here"
REDIRECT_URI = "http://localhost:5000/callback"
AUTH_URL = "https://wpengineapi.com/oauth/authorize"
TOKEN_URL = "https://wpengineapi.com/oauth/token"
API_BASE_URL = "https://wpengineapi.com/v1"

@app.route('/')
def index():
    return '<a href="/login">Login with WP Engine</a>'

@app.route('/login')
def login():
    # Generate a random state parameter to prevent CSRF
    state = secrets.token_urlsafe(16)
    session['oauth_state'] = state
    
    # Redirect to WP Engine's authorization endpoint
    auth_params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'sites:read',
        'state': state
    }
    
    auth_url = f"{AUTH_URL}?{'&'.join(f'{k}={v}' for k, v in auth_params.items())}"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    # Verify state parameter to prevent CSRF
    if request.args.get('state') != session.get('oauth_state'):
        return "State verification failed", 403
    
    # Exchange authorization code for access token
    if 'code' not in request.args:
        return "Authorization failed: No code received", 400
    
    code = request.args.get('code')
    
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    
    token_response = requests.post(TOKEN_URL, data=token_data)
    
    if token_response.status_code != 200:
        return f"Token exchange failed: {token_response.text}", 400
    
    token_info = token_response.json()
    session['access_token'] = token_info['access_token']
    session['refresh_token'] = token_info['refresh_token']
    
    return redirect('/sites')

@app.route('/sites')
def list_sites():
    # Check if user is authenticated
    if 'access_token' not in session:
        return redirect('/login')
    
    # Get sites using the access token
    headers = {
        'Authorization': f"Bearer {session['access_token']}",
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f"{API_BASE_URL}/sites", headers=headers)
    
    if response.status_code != 200:
        if response.status_code == 401:
            # Token might be expired, try refreshing
            return redirect('/refresh')
        return f"API request failed: {response.text}", 400
    
    sites = response.json()
    
    # Build HTML response
    html = "<h1>Your WP Engine Sites</h1><ul>"
    for site in sites['results']:
        html += f"<li>{site['name']} ({site['url']})</li>"
    html += "</ul>"
    
    return html

@app.route('/refresh')
def refresh_token():
    # Check if refresh token exists
    if 'refresh_token' not in session:
        return redirect('/login')
    
    # Exchange refresh token for new access token
    token_data = {
        'grant_type': 'refresh_token',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': session['refresh_token']
    }
    
    token_response = requests.post(TOKEN_URL, data=token_data)
    
    if token_response.status_code != 200:
        # Refresh token might be invalid, redirect to login
        return redirect('/login')
    
    token_info = token_response.json()
    session['access_token'] = token_info['access_token']
    if 'refresh_token' in token_info:
        session['refresh_token'] = token_info['refresh_token']
    
    return redirect('/sites')

if __name__ == '__main__':
    app.run(debug=True)
```

### Single-Page Application Example (JavaScript with PKCE)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WP Engine API OAuth Example</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px 20px; background: #0ecad4; color: white; border: none; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>WP Engine API OAuth Example (PKCE)</h1>
    <div id="app">
        <div id="login-section">
            <p>Click the button below to authenticate with WP Engine:</p>
            <button id="login-button">Login with WP Engine</button>
        </div>
        <div id="sites-section" style="display: none;">
            <h2>Your WP Engine Sites</h2>
            <div id="sites-list"></div>
            <pre id="sites-json"></pre>
        </div>
    </div>

    <script>
        // OAuth configuration
        const CLIENT_ID = 'your_client_id_here';
        const REDIRECT_URI = window.location.origin + window.location.pathname;
        const AUTH_URL = 'https://wpengineapi.com/oauth/authorize';
        const TOKEN_URL = 'https://wpengineapi.com/oauth/token';
        const API_BASE_URL = 'https://wpengineapi.com/v1';

        // PKCE helper functions
        async function generateCodeVerifier() {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            return base64UrlEncode(array);
        }

        async function generateCodeChallenge(codeVerifier) {
            const encoder = new TextEncoder();
            const data = encoder.encode(codeVerifier);
            const digest = await window.crypto.subtle.digest('SHA-256', data);
            return base64UrlEncode(new Uint8Array(digest));
        }

        function base64UrlEncode(array) {
            return btoa(String.fromCharCode.apply(null, array))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }

        // Generate random state
        function generateState() {
            const array = new Uint8Array(16);
            window.crypto.getRandomValues(array);
            return base64UrlEncode(array);
        }

        // Parse query parameters
        function getQueryParams() {
            const params = {};
            const queryString = window.location.search.substring(1);
            const pairs = queryString.split('&');
            
            for (const pair of pairs) {
                const [key, value] = pair.split('=');
                if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
            
            return params;
        }

        // Initialize the application
        async function init() {
            const params = getQueryParams();
            
            // Check if we're returning from the OAuth redirect
            if (params.code) {
                // Verify state parameter
                const savedState = localStorage.getItem('oauth_state');
                if (params.state !== savedState) {
                    alert('State verification failed. The request may have been tampered with.');
                    return;
                }
                
                // Exchange code for token
                const codeVerifier = localStorage.getItem('code_verifier');
                await exchangeCodeForToken(params.code, codeVerifier);
                
                // Clean up localStorage
                localStorage.removeItem('oauth_state');
                localStorage.removeItem('code_verifier');
                
                // Remove query parameters from URL
                window.history.replaceState({}, document.title, REDIRECT_URI);
            }
            
            // Check if we have an access token
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                // Show sites section
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('sites-section').style.display = 'block';
                
                // Fetch and display sites
                await fetchSites();
            }
            
            // Set up login button
            document.getElementById('login-button').addEventListener('click', initiateLogin);
        }

        // Start the OAuth flow
        async function initiateLogin() {
            // Generate PKCE code verifier and challenge
            const codeVerifier = await generateCodeVerifier();
            const codeChallenge = await generateCodeChallenge(codeVerifier);
            
            // Generate and save state
            const state = generateState();
            
            // Save in localStorage for later verification
            localStorage.setItem('code_verifier', codeVerifier);
            localStorage.setItem('oauth_state', state);
            
            // Build authorization URL
            const authParams = new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: 'code',
                scope: 'sites:read',
                state: state,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256'
            });
            
            // Redirect to authorization endpoint
            window.location.href = `${AUTH_URL}?${authParams.toString()}`;
        }

        // Exchange authorization code for access token
        async function exchangeCodeForToken(code, codeVerifier) {
            const tokenParams = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier
            });
            
            try {
                // In a real application, you would want to use a proxy server for this request
                // to avoid exposing your client ID in the browser
                const response = await fetch(TOKEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: tokenParams.toString()
                });
                
                if (!response.ok) {
                    throw new Error(`Token exchange failed: ${response.status}`);
                }
                
                const tokenData = await response.json();
                
                // Save tokens
                localStorage.setItem('access_token', tokenData.access_token);
                localStorage.setItem('refresh_token', tokenData.refresh_token);
                localStorage.setItem('token_expiry', Date.now() + (tokenData.expires_in * 1000));
                
                return tokenData;
            } catch (error) {
                console.error('Error exchanging code for token:', error);
                alert('Authentication failed. Please try again.');
            }
        }

        // Fetch sites from the API
        async function fetchSites() {
            // Check if token is expired
            const tokenExpiry = localStorage.getItem('token_expiry');
            if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                await refreshAccessToken();
            }
            
            const accessToken = localStorage.getItem('access_token');
            
            try {
                const response = await fetch(`${API_BASE_URL}/sites`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        // Token might be invalid, try refreshing
                        await refreshAccessToken();
                        return fetchSites();
                    }
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const sitesData = await response.json();
                
                // Display sites
                const sitesList = document.getElementById('sites-list');
                sitesList.innerHTML = '';
                
                const ul = document.createElement('ul');
                sitesData.results.forEach(site => {
                    const li = document.createElement('li');
                    li.textContent = `${site.name} (${site.url})`;
                    ul.appendChild(li);
                });
                
                sitesList.appendChild(ul);
                
                // Display JSON
                document.getElementById('sites-json').textContent = JSON.stringify(sitesData, null, 2);
                
                return sitesData;
            } catch (error) {
                console.error('Error fetching sites:', error);
                alert('Failed to fetch sites. Please try again.');
            }
        }

        // Refresh the access token
        async function refreshAccessToken() {
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (!refreshToken) {
                // No refresh token, redirect to login
                localStorage.clear();
                window.location.reload();
                return;
            }
            
            const tokenParams = new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                refresh_token: refreshToken
            });
            
            try {
                // In a real application, you would want to use a proxy server for this request
                const response = await fetch(TOKEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: tokenParams.toString()
                });
                
                if (!response.ok) {
                    throw new Error(`Token refresh failed: ${response.status}`);
                }
                
                const tokenData = await response.json();
                
                // Save new tokens
                localStorage.setItem('access_token', tokenData.access_token);
                if (tokenData.refresh_token) {
                    localStorage.setItem('refresh_token', tokenData.refresh_token);
                }
                localStorage.setItem('token_expiry', Date.now() + (tokenData.expires_in * 1000));
                
                return tokenData;
            } catch (error) {
                console.error('Error refreshing token:', error);
                // Clear storage and redirect to login
                localStorage.clear();
                window.location.reload();
            }
        }

        // Initialize the application when the page loads
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
```

## Best Practices

When implementing authentication for the WP Engine Customer API, follow these best practices:

1. **Store credentials securely**:
   - Never expose client secrets or API keys in client-side code
   - Use environment variables or secure credential storage
   - For web applications, use a server-side proxy to handle token exchange

2. **Implement proper error handling**:
   - Handle authentication errors gracefully
   - Implement token refresh logic
   - Provide clear error messages to users

3. **Use PKCE for public clients**:
   - Always use PKCE for single-page applications or mobile apps
   - Generate cryptographically secure code verifiers
   - Verify state parameters to prevent CSRF attacks

4. **Manage token lifecycle**:
   - Store tokens securely
   - Refresh tokens before they expire
   - Implement proper logout functionality

5. **Request minimal scopes**:
   - Only request the scopes your application needs
   - Document the required scopes in your application

## Next Steps

Now that you understand how to authenticate with the WP Engine Customer API, you can:

- Explore the [API Reference](/api-reference/overview/) to learn about available endpoints
- Try the [Quick Start Guide](/getting-started/quick-start/) for more examples
- Learn about [Pagination](/api-reference/pagination/) for handling large result sets
