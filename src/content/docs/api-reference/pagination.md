---
title: Pagination
description: Learn how to work with paginated responses in the WP Engine Customer API
---

# Pagination

The WP Engine Customer API uses pagination to limit the amount of data returned in a single response. This helps improve performance and reduces the load on both the client and server. This guide explains how to work with paginated responses.

## How Pagination Works

When you make a request to an endpoint that returns multiple items (like `/sites` or `/backups`), the API will return a subset of the results along with pagination metadata. By default, the API returns 10 items per page.

## Pagination Metadata

Each paginated response includes a `pagination` object with the following properties:

```json
{
  "results": [...],
  "pagination": {
    "total": 45,        // Total number of items
    "count": 10,         // Number of items in the current page
    "per_page": 10,      // Number of items per page
    "current_page": 1,   // Current page number
    "total_pages": 5     // Total number of pages
  }
}
```

## Navigating Through Pages

To navigate through pages, you can use the `page` and `per_page` query parameters:

- `page`: The page number to retrieve (default: 1)
- `per_page`: The number of items per page (default: 10, max: 100)

### Example: Retrieving a Specific Page

```bash
curl -X GET "https://wpengineapi.com/v1/sites?page=2&per_page=20" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

This request will retrieve the second page of results, with 20 items per page.

## Handling Pagination in Code

Here are examples of how to handle pagination in different programming languages:

### Python

```python
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://wpengineapi.com/v1"

headers = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json"
}

# Function to fetch all pages of results
def get_all_pages(endpoint):
    all_results = []
    page = 1
    
    while True:
        response = requests.get(f"{BASE_URL}/{endpoint}?page={page}", headers=headers)
        data = response.json()
        
        all_results.extend(data["results"])
        
        # Check if we've reached the last page
        if page >= data["pagination"]["total_pages"]:
            break
            
        page += 1
    
    return all_results

# Get all sites
all_sites = get_all_pages("sites")
print(f"Retrieved {len(all_sites)} sites")
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

// Function to fetch all pages of results
async function getAllPages(endpoint) {
  let allResults = [];
  let page = 1;
  let hasMorePages = true;
  
  while (hasMorePages) {
    const response = await axios.get(`${BASE_URL}/${endpoint}?page=${page}`, { headers });
    const data = response.data;
    
    allResults = allResults.concat(data.results);
    
    // Check if we've reached the last page
    if (page >= data.pagination.total_pages) {
      hasMorePages = false;
    } else {
      page++;
    }
  }
  
  return allResults;
}

// Get all sites
getAllPages('sites')
  .then(allSites => {
    console.log(`Retrieved ${allSites.length} sites`);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
```

### PHP

```php
<?php
function getAllPages($endpoint, $apiKey) {
    $baseUrl = 'https://wpengineapi.com/v1';
    $allResults = [];
    $page = 1;
    $hasMorePages = true;
    
    $headers = [
        'Authorization: ApiKey ' . $apiKey,
        'Content-Type: application/json'
    ];
    
    while ($hasMorePages) {
        $ch = curl_init($baseUrl . '/' . $endpoint . '?page=' . $page);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $data = json_decode($response, true);
        
        $allResults = array_merge($allResults, $data['results']);
        
        // Check if we've reached the last page
        if ($page >= $data['pagination']['total_pages']) {
            $hasMorePages = false;
        } else {
            $page++;
        }
    }
    
    return $allResults;
}

// Get all sites
$apiKey = 'YOUR_API_KEY';
$allSites = getAllPages('sites', $apiKey);
echo 'Retrieved ' . count($allSites) . ' sites';
?>
```

## Cursor-Based Pagination

For some endpoints that return large datasets, the API may use cursor-based pagination instead of page-based pagination. Cursor-based pagination is more efficient for large datasets and ensures consistency when new items are added or removed.

With cursor-based pagination, the response includes a `next_cursor` field that you can use to retrieve the next page of results:

```json
{
  "results": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6IjEyMzQ1In0="
  }
}
```

To retrieve the next page, include the `cursor` parameter in your request:

```bash
curl -X GET "https://wpengineapi.com/v1/logs?cursor=eyJpZCI6IjEyMzQ1In0=" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

When there are no more results, the `next_cursor` field will be `null`.

### Handling Cursor-Based Pagination in Code

Here's an example of how to handle cursor-based pagination in Python:

```python
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://wpengineapi.com/v1"

headers = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json"
}

# Function to fetch all pages of results with cursor-based pagination
def get_all_with_cursor(endpoint):
    all_results = []
    cursor = None
    
    while True:
        url = f"{BASE_URL}/{endpoint}"
        if cursor:
            url += f"?cursor={cursor}"
            
        response = requests.get(url, headers=headers)
        data = response.json()
        
        all_results.extend(data["results"])
        
        # Check if we've reached the last page
        if "next_cursor" not in data["pagination"] or data["pagination"]["next_cursor"] is None:
            break
            
        cursor = data["pagination"]["next_cursor"]
    
    return all_results

# Get all logs
all_logs = get_all_with_cursor("logs")
print(f"Retrieved {len(all_logs)} log entries")
```

## Best Practices

1. **Use the `per_page` parameter wisely**: Requesting too many items per page can slow down the response time. Start with the default (10) and adjust as needed.

2. **Implement pagination in your application**: Don't try to fetch all pages at once for large datasets. Instead, implement pagination in your UI and fetch pages as needed.

3. **Cache results when appropriate**: If you're making multiple requests for the same data, consider caching the results to reduce API calls.

4. **Handle rate limits**: Be aware of the API's rate limits and implement appropriate backoff strategies if you're making many requests.

5. **Use filtering**: When possible, use filtering parameters to reduce the total number of results before pagination.

## Next Steps

- Learn about [Error Handling](/api-reference/error-handling/)
- Explore the [API Reference](/api-reference/overview/)
- Try the [Quick Start Guide](/getting-started/quick-start/)
