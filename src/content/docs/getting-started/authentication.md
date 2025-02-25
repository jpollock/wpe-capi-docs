---
title: Authentication
description: Learn how to authenticate with the WP Engine Customer API
---

# Authentication

The WP Engine Customer API uses OAuth 2.0 for authentication, providing a secure way to access the API without exposing your credentials.

## Authentication Methods

There are two primary methods for authenticating with the WP Engine Customer API:

1. **OAuth 2.0 Authorization Code Flow** - For applications that need to access the API on behalf of a WP Engine user
2. **API Keys** - For server-to-server integrations and automated scripts

## OAuth 2.0 Authorization Code Flow

This flow is ideal for applications that need to access the API on behalf of a WP Engine user. It involves redirecting the user to WP Engine's authorization page, where they grant permission to your application.

### Step 1: Register Your Application

Before you can use OAuth, you need to register your application with WP Engine:

1. Log in to your WP Engine account
2. Navigate to the Developer Portal
3. Click "Create New Application"
4. Provide your application details:
   - Name
   - Description
   - Redirect URI (where users will be sent after authorization)
5. Submit the form to receive your Client ID and Client Secret

### Step 2: Request Authorization

Redirect your user to the WP Engine authorization URL:

```
https://wpengineapi.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  response_type=code&
  scope=sites:read sites:write
```

### Step 3: Handle the Callback

After the user authorizes your application, they'll be redirected to your redirect URI with an authorization code:

```
https://your-app.com/callback?code=AUTHORIZATION_CODE
```

### Step 4: Exchange the Code for an Access Token

Make a POST request to exchange the authorization code for an access token:

```bash
curl -X POST https://wpengineapi.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d grant_type=authorization_code \
  -d code=AUTHORIZATION_CODE \
  -d redirect_uri=YOUR_REDIRECT_URI
```

The response will include your access token:

```json
{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

### Step 5: Use the Access Token

Include the access token in the Authorization header of your API requests:

```bash
curl -X GET https://wpengineapi.com/v1/sites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 6: Refresh the Access Token

Access tokens expire after a period of time. Use the refresh token to get a new access token:

```bash
curl -X POST https://wpengineapi.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d grant_type=refresh_token \
  -d refresh_token=YOUR_REFRESH_TOKEN
```

## API Keys

API keys are simpler to use but should only be used for server-to-server integrations where OAuth is not practical.

### Creating an API Key

1. Log in to your WP Engine account
2. Navigate to the User Settings page
3. Click on "API Keys"
4. Click "Generate New API Key"
5. Provide a description for the key
6. Copy the generated API key (it will only be shown once)

### Using an API Key

Include the API key in the Authorization header of your requests:

```bash
curl -X GET https://wpengineapi.com/v1/sites \
  -H "Authorization: ApiKey YOUR_API_KEY"
```

## Security Best Practices

- Never expose your Client Secret or API Key in client-side code
- Store tokens securely and encrypt them at rest
- Implement token refresh logic to handle expired tokens
- Use HTTPS for all API requests
- Request only the scopes your application needs
- Revoke tokens when they're no longer needed

## Next Steps

Now that you understand authentication, you're ready to start making API requests. Check out the [Quick Start Guide](/getting-started/quick-start/) for examples of common API operations.
