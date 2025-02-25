---
title: API Authentication
description: Detailed reference for authenticating with the WP Engine Customer API
---

# API Authentication

This page provides detailed technical reference for authenticating with the WP Engine Customer API. For a more beginner-friendly guide, see the [Authentication Getting Started Guide](/getting-started/authentication/).

## Authentication Methods

The WP Engine Customer API supports two authentication methods:

1. **OAuth 2.0** - For applications that need to access the API on behalf of a WP Engine user
2. **API Keys** - For server-to-server integrations and automated scripts

## OAuth 2.0

The API implements the OAuth 2.0 Authorization Framework ([RFC 6749](https://tools.ietf.org/html/rfc6749)) to provide secure delegated access to API resources.

### Available OAuth Flows

The API supports the following OAuth 2.0 flows:

1. **Authorization Code Flow** - For web applications
2. **Authorization Code Flow with PKCE** - For mobile and single-page applications
3. **Client Credentials Flow** - For server-to-server applications

### Authorization Code Flow

#### Step 1: Authorization Request

```
GET https://wpengineapi.com/oauth/authorize
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your application's client ID |
| `redirect_uri` | Yes | The URI to redirect to after authorization |
| `response_type` | Yes | Must be `code` |
| `scope` | Yes | Space-separated list of scopes |
| `state` | Recommended | Random string to prevent CSRF attacks |

**Example Request:**

```
https://wpengineapi.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://your-app.com/callback&
  response_type=code&
  scope=sites:read sites:write&
  state=random_state_string
```

#### Step 2: Authorization Response

After the user authorizes your application, they'll be redirected to your redirect URI with an authorization code:

```
https://your-app.com/callback?code=AUTHORIZATION_CODE&state=random_state_string
```

#### Step 3: Token Request

```
POST https://wpengineapi.com/oauth/token
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `authorization_code` |
| `client_id` | Yes | Your application's client ID |
| `client_secret` | Yes | Your application's client secret |
| `code` | Yes | The authorization code received in step 2 |
| `redirect_uri` | Yes | The same redirect URI used in step 1 |

**Example Request:**

```bash
curl -X POST https://wpengineapi.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&
      client_id=YOUR_CLIENT_ID&
      client_secret=YOUR_CLIENT_SECRET&
      code=AUTHORIZATION_CODE&
      redirect_uri=https://your-app.com/callback"
```

**Example Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def502003b1e76a0d9fb...",
  "scope": "sites:read sites:write"
}
```

### Authorization Code Flow with PKCE

For public clients (mobile apps, single-page applications), use the Authorization Code Flow with Proof Key for Code Exchange (PKCE) to enhance security.

#### Step 1: Generate a Code Verifier and Challenge

1. Generate a cryptographically random string (code verifier)
2. Create a code challenge by applying SHA-256 to the code verifier and base64url-encoding the result

```javascript
// Example in JavaScript
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  return window.crypto.subtle.digest('SHA-256', data)
    .then(digest => base64UrlEncode(new Uint8Array(digest)));
}

function base64UrlEncode(array) {
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
```

#### Step 2: Authorization Request with PKCE

```
GET https://wpengineapi.com/oauth/authorize
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your application's client ID |
| `redirect_uri` | Yes | The URI to redirect to after authorization |
| `response_type` | Yes | Must be `code` |
| `scope` | Yes | Space-separated list of scopes |
| `code_challenge` | Yes | The code challenge generated in step 1 |
| `code_challenge_method` | Yes | Must be `S256` |
| `state` | Recommended | Random string to prevent CSRF attacks |

**Example Request:**

```
https://wpengineapi.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://your-app.com/callback&
  response_type=code&
  scope=sites:read sites:write&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256&
  state=random_state_string
```

#### Step 3: Token Request with PKCE

```
POST https://wpengineapi.com/oauth/token
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `authorization_code` |
| `client_id` | Yes | Your application's client ID |
| `code` | Yes | The authorization code received in step 2 |
| `redirect_uri` | Yes | The same redirect URI used in step 2 |
| `code_verifier` | Yes | The code verifier generated in step 1 |

**Example Request:**

```bash
curl -X POST https://wpengineapi.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&
      client_id=YOUR_CLIENT_ID&
      code=AUTHORIZATION_CODE&
      redirect_uri=https://your-app.com/callback&
      code_verifier=CODE_VERIFIER"
```

### Client Credentials Flow

For server-to-server applications that don't act on behalf of a user.

```
POST https://wpengineapi.com/oauth/token
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `client_credentials` |
| `client_id` | Yes | Your application's client ID |
| `client_secret` | Yes | Your application's client secret |
| `scope` | Yes | Space-separated list of scopes |

**Example Request:**

```bash
curl -X POST https://wpengineapi.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&
      client_id=YOUR_CLIENT_ID&
      client_secret=YOUR_CLIENT_SECRET&
      scope=sites:read sites:write"
```

### Refreshing Access Tokens

Access tokens expire after a period of time (typically 1 hour). Use the refresh token to get a new access token:

```
POST https://wpengineapi.com/oauth/token
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `refresh_token` |
| `client_id` | Yes | Your application's client ID |
| `client_secret` | Yes | Your application's client secret |
| `refresh_token` | Yes | The refresh token received in the token response |

**Example Request:**

```bash
curl -X POST https://wpengineapi.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&
      client_id=YOUR_CLIENT_ID&
      client_secret=YOUR_CLIENT_SECRET&
      refresh_token=REFRESH_TOKEN"
```

### Using Access Tokens

Include the access token in the Authorization header of your API requests:

```bash
curl -X GET https://wpengineapi.com/v1/sites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Revoking Tokens

To revoke an access or refresh token:

```
POST https://wpengineapi.com/oauth/revoke
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `token` | Yes | The token to revoke |
| `client_id` | Yes | Your application's client ID |
| `client_secret` | Yes | Your application's client secret |

**Example Request:**

```bash
curl -X POST https://wpengineapi.com/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=TOKEN_TO_REVOKE&
      client_id=YOUR_CLIENT_ID&
      client_secret=YOUR_CLIENT_SECRET"
```

## API Keys

API keys provide a simpler authentication method for server-to-server integrations.

### Creating an API Key

API keys can be created in the WP Engine User Portal:

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

### API Key Permissions

API keys inherit the permissions of the user who created them. If the user has access to multiple sites, the API key will have access to those same sites.

### Revoking an API Key

To revoke an API key:

1. Log in to your WP Engine account
2. Navigate to the User Settings page
3. Click on "API Keys"
4. Find the API key you want to revoke
5. Click "Revoke"

## Available Scopes

OAuth 2.0 uses scopes to limit an application's access to a user's account. Request only the scopes your application needs.

| Scope | Description |
|-------|-------------|
| `sites:read` | Read access to sites |
| `sites:write` | Write access to sites |
| `backups:read` | Read access to backups |
| `backups:write` | Write access to backups |
| `deployments:read` | Read access to deployments |
| `deployments:write` | Write access to deployments |
| `domains:read` | Read access to domains |
| `domains:write` | Write access to domains |
| `ssl:read` | Read access to SSL certificates |
| `ssl:write` | Write access to SSL certificates |
| `users:read` | Read access to users |
| `users:write` | Write access to users |
| `logs:read` | Read access to logs |
| `metrics:read` | Read access to metrics |

## Security Best Practices

1. **Store credentials securely**: Never expose client secrets or API keys in client-side code or public repositories.

2. **Use HTTPS**: Always use HTTPS for all API requests.

3. **Implement PKCE**: For public clients, always use the Authorization Code Flow with PKCE.

4. **Validate state parameter**: Always validate the state parameter in the OAuth callback to prevent CSRF attacks.

5. **Request minimal scopes**: Only request the scopes your application needs.

6. **Implement token refresh**: Automatically refresh access tokens when they expire.

7. **Revoke unused tokens**: Revoke tokens when they're no longer needed.

8. **Implement rate limiting**: Implement appropriate backoff strategies if you're making many requests.

9. **Monitor for suspicious activity**: Monitor API usage for suspicious activity and revoke tokens if necessary.

10. **Keep dependencies updated**: Keep your OAuth and API client libraries updated to ensure you have the latest security fixes.

## Troubleshooting

### Common OAuth Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `invalid_request` | The request is missing a required parameter | Check that all required parameters are included |
| `invalid_client` | Client authentication failed | Check your client ID and client secret |
| `invalid_grant` | The authorization code or refresh token is invalid | Request a new authorization code or refresh token |
| `unauthorized_client` | The client is not authorized to use the requested grant type | Check that your application is configured for the requested grant type |
| `unsupported_grant_type` | The grant type is not supported | Check that you're using a supported grant type |
| `invalid_scope` | The requested scope is invalid or unknown | Check that you're requesting valid scopes |

### Common API Key Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `invalid_api_key` | The API key is invalid | Check that you're using a valid API key |
| `expired_api_key` | The API key has expired | Generate a new API key |
| `revoked_api_key` | The API key has been revoked | Generate a new API key |

## Next Steps

- Learn about [Pagination](/api-reference/pagination/)
- Explore the [API Reference](/api-reference/overview/)
- Try the [Quick Start Guide](/getting-started/quick-start/)
