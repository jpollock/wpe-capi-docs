---
title: Quick Start Guide
description: Get up and running with the WP Engine Customer API in minutes
---

This guide will help you make your first API request to the WP Engine Customer API. We'll walk through the process of authenticating and retrieving a list of your sites.

## Prerequisites

Before you begin, make sure you have:

- A WP Engine account
- API credentials (see the [Authentication guide](/getting-started/authentication/))
- Basic knowledge of making HTTP requests (using cURL, Postman, or your preferred programming language)

## Step 1: Authenticate

For this quick start, we'll use basic authentication with your API credentials. If you're building a user-facing application, you should use OAuth 2.0 instead.

First, [generate API credentials](/getting-started/authentication/#creating-an-api-key) if you don't already have them. You'll need both an API user ID and password.

## Step 2: Make Your First API Request

Let's retrieve a list of your WP Engine sites. This is a simple GET request to the `/sites` endpoint:

```bash
curl -X GET https://api.wpengineapi.com/v1/sites \
  -u "API_USER_ID:API_USER_PASSWORD"
```

Replace `API_USER_ID` and `API_USER_PASSWORD` with your actual API credentials.

### Example Response

```json
{
  "previous": "https://api.wpengineapi.com/v1/sites?limit=100&offset=0",
  "next": "https://api.wpengineapi.com/v1/sites?limit=100&offset=200",
  "count": 225,
  "results": [
    {
      "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
      "name": "Torque Magazine",
      "account": {
        "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
      },
      "tags": [
        "production"
      ],
      "installs": []
    }
  ]
}
```

## Step 3: Get Site Details

Now, let's get more details about a specific site. Use the site ID from the previous response:

```bash
curl -X GET https://api.wpengineapi.com/v1/sites/28c78b6d-c2da-4f09-85f5-1ad588089b2d \
  -u "API_USER_ID:API_USER_PASSWORD"
```

### Example Response

```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "name": "Torque Magazine",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  },
  "tags": [
    "production"
  ],
  "installs": []
}
```

## Step 4: List Your WordPress Installations

To work with backups and other install-specific operations, you'll need to get your WordPress installations:

```bash
curl -X GET https://api.wpengineapi.com/v1/installs \
  -u "API_USER_ID:API_USER_PASSWORD"
```

### Example Response

```json
{
  "previous": "https://api.wpengineapi.com/v1/installs?limit=100&offset=0",
  "next": "https://api.wpengineapi.com/v1/installs?limit=100&offset=200",
  "count": 225,
  "results": [
    {
      "id": "294deacc-d8b8-4005-82c4-0727ba8ddde0",
      "name": "torquemag",
      "account": {
        "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
      },
      "php_version": "7.0",
      "status": "active",
      "cname": "mywebsite.wpengine.com"
    }
  ]
}
```

## Step 5: Create a Backup

Let's create a backup of your WordPress installation:

```bash
curl -X POST https://api.wpengineapi.com/v1/installs/294deacc-d8b8-4005-82c4-0727ba8ddde0/backups \
  -u "API_USER_ID:API_USER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Quick start backup example",
    "notification_emails": ["your-email@example.com"]
  }'
```

### Example Response

```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "status": "requested"
}
```

## Step 6: Create an Account User

Let's create a new user for your account. You'll need your account ID from the previous responses:

```bash
curl -X POST https://api.wpengineapi.com/v1/accounts/eeda3227-9a39-46ae-9e14-20958bb4e6c9/account_users \
  -u "API_USER_ID:API_USER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "roles": "partial"
    }
  }'
```

### Example Response

```json
{
  "message": "Your change was successful.",
  "account_user": {
    "user_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
    "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": null,
    "invite_accepted": false,
    "mfa_enabled": false,
    "roles": "partial"
  }
}
```

## Step 7: Check Backup Status

You can check the status of your backup:

```bash
curl -X GET https://api.wpengineapi.com/v1/installs/294deacc-d8b8-4005-82c4-0727ba8ddde0/backups/28c78b6d-c2da-4f09-85f5-1ad588089b2d \
  -u "API_USER_ID:API_USER_PASSWORD"
```

### Example Response

```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "status": "requested"
}
```

## Next Steps

Congratulations! You've made your first API requests to the WP Engine Customer API. Here are some next steps:

1. Explore the [API Reference](/api-reference/overview/) to learn about all available endpoints
2. Check out the [Examples](/examples/) for more complex use cases
3. Learn about [Pagination](/api-reference/pagination/) for handling large result sets
4. Implement proper [Error Handling](/api-reference/error-handling/) in your application

## Code Examples

### Python

```python
import requests
import base64

API_USER_ID = "YOUR_API_USER_ID"
API_PASSWORD = "YOUR_API_PASSWORD"
BASE_URL = "https://api.wpengineapi.com/v1"

# Create basic auth header
auth_string = base64.b64encode(f'{API_USER_ID}:{API_PASSWORD}'.encode()).decode()
headers = {
    "Authorization": f"Basic {auth_string}"
}

# Get all sites
response = requests.get(f"{BASE_URL}/sites", headers=headers)
response.raise_for_status()
sites = response.json()
print(sites)

# Get specific site
if sites["results"]:
    site_id = sites["results"][0]["id"]
    response = requests.get(f"{BASE_URL}/sites/{site_id}", headers=headers)
    response.raise_for_status()
    site_details = response.json()
    print(site_details)
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_USER_ID = 'YOUR_API_USER_ID';
const API_PASSWORD = 'YOUR_API_PASSWORD';
const BASE_URL = 'https://api.wpengineapi.com/v1';

const headers = {
  'Authorization': 'Basic ' + Buffer.from(`${API_USER_ID}:${API_PASSWORD}`).toString('base64')
};

async function makeRequests() {
  try {
    // Get all sites
    const sitesResponse = await axios.get(`${BASE_URL}/sites`, { headers });
    console.log(sitesResponse.data);
    
    // Get specific site
    if (sitesResponse.data.results.length > 0) {
      const siteId = sitesResponse.data.results[0].id;
      const siteResponse = await axios.get(`${BASE_URL}/sites/${siteId}`, { headers });
      console.log(siteResponse.data);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

makeRequests();
```

### PHP

```php
<?php
$apiUserId = 'YOUR_API_USER_ID';
$apiPassword = 'YOUR_API_PASSWORD';
$baseUrl = 'https://api.wpengineapi.com/v1';

$auth = base64_encode($apiUserId . ':' . $apiPassword);
$headers = [
    'Authorization: Basic ' . $auth
];

// Get all sites
$ch = curl_init($baseUrl . '/sites');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$sites = json_decode($response, true);
print_r($sites);

// Get specific site
if (!empty($sites['results'])) {
    $siteId = $sites['results'][0]['id'];
    $ch = curl_init($baseUrl . '/sites/' . $siteId);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $siteDetails = json_decode($response, true);
    print_r($siteDetails);
}

curl_close($ch);
?>
```

## Common Error Responses

When working with the API, you may encounter these common error responses:

### 401 Authentication Required

```json
{
  "message": "Authentication required"
}
```

This means your API credentials are missing or invalid. Double-check your `API_USER_ID` and `API_PASSWORD`.

### 403 Insufficient Permissions

```json
{
  "message": "Insufficient permissions to access this resource"
}
```

Your API credentials don't have permission to access the requested resource.

### 404 Resource Not Found

```json
{
  "message": "Resource not found"
}
```

The requested resource (site, install, backup, etc.) doesn't exist or you don't have access to it.

### 429 Rate Limit Exceeded

```json
{
  "message": "Rate limit exceeded - too many requests"
}
```

You've made too many requests in a short period. Wait a moment before making additional requests.

## Tips for Success

1. **Use UUIDs**: All resource IDs in the WP Engine API are UUIDs (like `28c78b6d-c2da-4f09-85f5-1ad588089b2d`)
2. **Handle Pagination**: Most list endpoints return paginated results with `previous`, `next`, and `count` fields
3. **Check Status Codes**: Always check HTTP status codes and handle errors appropriately
4. **Store Credentials Securely**: Never hardcode API credentials in your source code
5. **Use HTTPS**: All API requests must use HTTPS

Ready to dive deeper? Check out the [complete API reference](/api-reference/overview/) for detailed documentation on all available endpoints.
