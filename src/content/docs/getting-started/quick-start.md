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

For this quick start, we'll use an API key for simplicity. If you're building a user-facing application, you should use OAuth 2.0 instead.

First, [generate an API key](/getting-started/authentication/#creating-an-api-key) if you don't already have one.

## Step 2: Make Your First API Request

Let's retrieve a list of your WP Engine sites. This is a simple GET request to the `/sites` endpoint:

```bash
curl -X GET https://wpengineapi.com/v1/sites \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Replace `YOUR_API_KEY` with your actual API key.

### Example Response

```json
{
  "results": [
    {
      "id": "site_12345",
      "name": "My WordPress Site",
      "environment": "production",
      "created_at": "2023-01-15T12:00:00Z",
      "url": "https://mysite.wpengine.com",
      "status": "active"
    },
    {
      "id": "site_67890",
      "name": "Another WordPress Site",
      "environment": "production",
      "created_at": "2023-02-20T14:30:00Z",
      "url": "https://anothersite.wpengine.com",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 2,
    "count": 2,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  }
}
```

## Step 3: Get Site Details

Now, let's get more details about a specific site. Use the site ID from the previous response:

```bash
curl -X GET https://wpengineapi.com/v1/sites/site_12345 \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Example Response

```json
{
  "id": "site_12345",
  "name": "My WordPress Site",
  "environment": "production",
  "created_at": "2023-01-15T12:00:00Z",
  "updated_at": "2023-03-10T09:45:00Z",
  "url": "https://mysite.wpengine.com",
  "status": "active",
  "php_version": "8.1",
  "wordpress_version": "6.2",
  "disk_usage": {
    "used": 2.5,
    "total": 10,
    "unit": "GB"
  },
  "bandwidth": {
    "current_month": 15.7,
    "unit": "GB"
  },
  "environments": [
    {
      "name": "production",
      "url": "https://mysite.wpengine.com"
    },
    {
      "name": "staging",
      "url": "https://stagingmysite.wpengine.com"
    },
    {
      "name": "development",
      "url": "https://devmysite.wpengine.com"
    }
  ]
}
```

## Step 4: Create a Backup

Let's create a backup of your site:

```bash
curl -X POST https://wpengineapi.com/v1/sites/site_12345/backups \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "My first API-created backup",
    "type": "full"
  }'
```

### Example Response

```json
{
  "id": "backup_54321",
  "site_id": "site_12345",
  "description": "My first API-created backup",
  "type": "full",
  "status": "in_progress",
  "created_at": "2023-04-01T10:30:00Z",
  "estimated_completion_time": "2023-04-01T10:45:00Z"
}
```

## Step 5: Check Backup Status

You can check the status of your backup:

```bash
curl -X GET https://wpengineapi.com/v1/sites/site_12345/backups/backup_54321 \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Example Response

```json
{
  "id": "backup_54321",
  "site_id": "site_12345",
  "description": "My first API-created backup",
  "type": "full",
  "status": "completed",
  "created_at": "2023-04-01T10:30:00Z",
  "completed_at": "2023-04-01T10:42:00Z",
  "size": "1.2GB",
  "download_url": "https://wpengineapi.com/v1/sites/site_12345/backups/backup_54321/download"
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

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://wpengineapi.com/v1"

headers = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json"
}

# Get all sites
response = requests.get(f"{BASE_URL}/sites", headers=headers)
sites = response.json()
print(sites)

# Get specific site
site_id = sites["results"][0]["id"]
response = requests.get(f"{BASE_URL}/sites/{site_id}", headers=headers)
site_details = response.json()
print(site_details)
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://wpengineapi.com/v1';

const headers = {
  'Authorization': `ApiKey ${API_KEY}`,
  'Content-Type': 'application/json'
};

// Get all sites
axios.get(`${BASE_URL}/sites`, { headers })
  .then(response => {
    console.log(response.data);
    
    // Get specific site
    const siteId = response.data.results[0].id;
    return axios.get(`${BASE_URL}/sites/${siteId}`, { headers });
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
```

### PHP

```php
<?php
$apiKey = 'YOUR_API_KEY';
$baseUrl = 'https://wpengineapi.com/v1';

$headers = [
    'Authorization: ApiKey ' . $apiKey,
    'Content-Type: application/json'
];

// Get all sites
$ch = curl_init($baseUrl . '/sites');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$sites = json_decode($response, true);
print_r($sites);

// Get specific site
$siteId = $sites['results'][0]['id'];
$ch = curl_init($baseUrl . '/sites/' . $siteId);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$siteDetails = json_decode($response, true);
print_r($siteDetails);

curl_close($ch);
?>
