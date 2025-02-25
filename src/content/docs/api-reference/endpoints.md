---
title: API Endpoints
description: Reference documentation for the WP Engine Customer API endpoints
---

# API Endpoints

This page provides an overview of the available endpoints in the WP Engine Customer API. Each endpoint is documented with its HTTP method, URL, description, and example requests and responses.

## Base URL

All API requests should be made to the following base URL:

```
https://wpengineapi.com/v1
```

## Authentication

All API requests require authentication. See the [Authentication guide](/api-reference/authentication/) for details on how to authenticate your requests.

## Sites

### List Sites

Retrieves a list of sites that the authenticated user has access to.

```
GET /sites
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Number of items per page (default: 10, max: 100) |
| `sort` | string | Field to sort by (e.g., `name`, `created_at`) |
| `order` | string | Sort order (`asc` or `desc`, default: `asc`) |
| `status` | string | Filter by status (e.g., `active`, `inactive`) |

**Example Request:**

```bash
curl -X GET "https://wpengineapi.com/v1/sites?per_page=2" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

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
    "total": 15,
    "count": 2,
    "per_page": 2,
    "current_page": 1,
    "total_pages": 8
  }
}
```

### Get Site

Retrieves detailed information about a specific site.

```
GET /sites/{site_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Example Request:**

```bash
curl -X GET "https://wpengineapi.com/v1/sites/site_12345" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

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

### Create Site

Creates a new WordPress site.

```
POST /sites
```

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name of the site |
| `environment` | string | No | The environment to create (default: `production`) |
| `php_version` | string | No | The PHP version to use (default: latest stable) |
| `wordpress_version` | string | No | The WordPress version to use (default: latest stable) |
| `template` | string | No | Template to use for the site (e.g., `blank`, `woocommerce`) |

**Example Request:**

```bash
curl -X POST "https://wpengineapi.com/v1/sites" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New WordPress Site",
    "php_version": "8.1",
    "wordpress_version": "6.2",
    "template": "blank"
  }'
```

**Example Response:**

```json
{
  "id": "site_54321",
  "name": "New WordPress Site",
  "environment": "production",
  "created_at": "2023-04-01T10:30:00Z",
  "url": "https://newsite.wpengine.com",
  "status": "provisioning",
  "php_version": "8.1",
  "wordpress_version": "6.2",
  "estimated_completion_time": "2023-04-01T10:45:00Z"
}
```

### Update Site

Updates an existing WordPress site.

```
PUT /sites/{site_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The new name of the site |
| `php_version` | string | No | The PHP version to use |
| `wordpress_version` | string | No | The WordPress version to use |
| `status` | string | No | The status of the site (e.g., `active`, `inactive`) |

**Example Request:**

```bash
curl -X PUT "https://wpengineapi.com/v1/sites/site_12345" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated WordPress Site",
    "php_version": "8.2"
  }'
```

**Example Response:**

```json
{
  "id": "site_12345",
  "name": "Updated WordPress Site",
  "environment": "production",
  "created_at": "2023-01-15T12:00:00Z",
  "updated_at": "2023-04-01T11:30:00Z",
  "url": "https://mysite.wpengine.com",
  "status": "active",
  "php_version": "8.2",
  "wordpress_version": "6.2"
}
```

### Delete Site

Deletes a WordPress site.

```
DELETE /sites/{site_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Example Request:**

```bash
curl -X DELETE "https://wpengineapi.com/v1/sites/site_12345" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "id": "site_12345",
  "status": "deleting",
  "estimated_completion_time": "2023-04-01T12:15:00Z"
}
```

## Backups

### List Backups

Retrieves a list of backups for a specific site.

```
GET /sites/{site_id}/backups
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Number of items per page (default: 10, max: 100) |
| `sort` | string | Field to sort by (e.g., `created_at`) |
| `order` | string | Sort order (`asc` or `desc`, default: `desc`) |
| `status` | string | Filter by status (e.g., `completed`, `in_progress`) |

**Example Request:**

```bash
curl -X GET "https://wpengineapi.com/v1/sites/site_12345/backups" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "results": [
    {
      "id": "backup_54321",
      "site_id": "site_12345",
      "description": "Pre-update backup",
      "type": "full",
      "status": "completed",
      "created_at": "2023-03-15T10:30:00Z",
      "completed_at": "2023-03-15T10:45:00Z",
      "size": "1.2GB"
    },
    {
      "id": "backup_54322",
      "site_id": "site_12345",
      "description": "Weekly automatic backup",
      "type": "full",
      "status": "completed",
      "created_at": "2023-03-08T10:30:00Z",
      "completed_at": "2023-03-08T10:48:00Z",
      "size": "1.1GB"
    }
  ],
  "pagination": {
    "total": 10,
    "count": 2,
    "per_page": 2,
    "current_page": 1,
    "total_pages": 5
  }
}
```

### Get Backup

Retrieves detailed information about a specific backup.

```
GET /sites/{site_id}/backups/{backup_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |
| `backup_id` | string | The ID of the backup |

**Example Request:**

```bash
curl -X GET "https://wpengineapi.com/v1/sites/site_12345/backups/backup_54321" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "id": "backup_54321",
  "site_id": "site_12345",
  "description": "Pre-update backup",
  "type": "full",
  "status": "completed",
  "created_at": "2023-03-15T10:30:00Z",
  "completed_at": "2023-03-15T10:45:00Z",
  "size": "1.2GB",
  "download_url": "https://wpengineapi.com/v1/sites/site_12345/backups/backup_54321/download",
  "contents": {
    "database": true,
    "files": true,
    "plugins": true,
    "themes": true
  }
}
```

### Create Backup

Creates a new backup for a specific site.

```
POST /sites/{site_id}/backups
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | No | A description of the backup |
| `type` | string | No | The type of backup (`full` or `database`, default: `full`) |

**Example Request:**

```bash
curl -X POST "https://wpengineapi.com/v1/sites/site_12345/backups" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Pre-update backup",
    "type": "full"
  }'
```

**Example Response:**

```json
{
  "id": "backup_54323",
  "site_id": "site_12345",
  "description": "Pre-update backup",
  "type": "full",
  "status": "in_progress",
  "created_at": "2023-04-01T12:30:00Z",
  "estimated_completion_time": "2023-04-01T12:45:00Z"
}
```

### Restore Backup

Restores a backup to a site.

```
POST /sites/{site_id}/backups/{backup_id}/restore
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |
| `backup_id` | string | The ID of the backup |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `environment` | string | No | The environment to restore to (default: the environment the backup was taken from) |
| `contents` | object | No | Specific contents to restore (default: all contents) |

**Example Request:**

```bash
curl -X POST "https://wpengineapi.com/v1/sites/site_12345/backups/backup_54321/restore" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "staging",
    "contents": {
      "database": true,
      "files": true,
      "plugins": false,
      "themes": false
    }
  }'
```

**Example Response:**

```json
{
  "id": "restore_98765",
  "backup_id": "backup_54321",
  "site_id": "site_12345",
  "environment": "staging",
  "status": "in_progress",
  "created_at": "2023-04-01T13:30:00Z",
  "estimated_completion_time": "2023-04-01T13:45:00Z",
  "contents": {
    "database": true,
    "files": true,
    "plugins": false,
    "themes": false
  }
}
```

### Delete Backup

Deletes a backup.

```
DELETE /sites/{site_id}/backups/{backup_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |
| `backup_id` | string | The ID of the backup |

**Example Request:**

```bash
curl -X DELETE "https://wpengineapi.com/v1/sites/site_12345/backups/backup_54321" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "id": "backup_54321",
  "status": "deleting",
  "estimated_completion_time": "2023-04-01T14:00:00Z"
}
```

## Deployments

### List Deployments

Retrieves a list of deployments for a specific site.

```
GET /sites/{site_id}/deployments
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Number of items per page (default: 10, max: 100) |
| `sort` | string | Field to sort by (e.g., `created_at`) |
| `order` | string | Sort order (`asc` or `desc`, default: `desc`) |
| `status` | string | Filter by status (e.g., `completed`, `in_progress`) |

**Example Request:**

```bash
curl -X GET "https://wpengineapi.com/v1/sites/site_12345/deployments" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "results": [
    {
      "id": "deploy_12345",
      "site_id": "site_12345",
      "environment": "production",
      "source": {
        "type": "git",
        "repository": "github.com/username/repo",
        "branch": "main",
        "commit": "a1b2c3d4e5f6"
      },
      "status": "completed",
      "created_at": "2023-03-20T15:30:00Z",
      "completed_at": "2023-03-20T15:35:00Z"
    },
    {
      "id": "deploy_12346",
      "site_id": "site_12345",
      "environment": "staging",
      "source": {
        "type": "git",
        "repository": "github.com/username/repo",
        "branch": "develop",
        "commit": "f6e5d4c3b2a1"
      },
      "status": "completed",
      "created_at": "2023-03-18T10:30:00Z",
      "completed_at": "2023-03-18T10:34:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "count": 2,
    "per_page": 2,
    "current_page": 1,
    "total_pages": 4
  }
}
```

### Get Deployment

Retrieves detailed information about a specific deployment.

```
GET /sites/{site_id}/deployments/{deployment_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |
| `deployment_id` | string | The ID of the deployment |

**Example Request:**

```bash
curl -X GET "https://wpengineapi.com/v1/sites/site_12345/deployments/deploy_12345" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example Response:**

```json
{
  "id": "deploy_12345",
  "site_id": "site_12345",
  "environment": "production",
  "source": {
    "type": "git",
    "repository": "github.com/username/repo",
    "branch": "main",
    "commit": "a1b2c3d4e5f6"
  },
  "status": "completed",
  "created_at": "2023-03-20T15:30:00Z",
  "completed_at": "2023-03-20T15:35:00Z",
  "logs": "Deployment started at 2023-03-20T15:30:00Z\nCloning repository...\nChecking out branch main...\nInstalling dependencies...\nBuilding...\nDeploying...\nDeployment completed at 2023-03-20T15:35:00Z",
  "changes": {
    "added": 5,
    "modified": 10,
    "deleted": 2
  }
}
```

### Create Deployment

Creates a new deployment for a specific site.

```
POST /sites/{site_id}/deployments
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | The ID of the site |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `environment` | string | Yes | The environment to deploy to |
| `source` | object | Yes | The source of the deployment |
| `source.type` | string | Yes | The type of source (`git` or `zip`) |
| `source.repository` | string | Conditional | The Git repository URL (required if `source.type` is `git`) |
| `source.branch` | string | Conditional | The Git branch (required if `source.type` is `git`) |
| `source.commit` | string | No | The Git commit (default: latest commit on the branch) |
| `source.zip_url` | string | Conditional | The URL of the ZIP file (required if `source.type` is `zip`) |

**Example Request:**

```bash
curl -X POST "https://wpengineapi.com/v1/sites/site_12345/deployments" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "staging",
    "source": {
      "type": "git",
      "repository": "github.com/username/repo",
      "branch": "develop"
    }
  }'
```

**Example Response:**

```json
{
  "id": "deploy_12347",
  "site_id": "site_12345",
  "environment": "staging",
  "source": {
    "type": "git",
    "repository": "github.com/username/repo",
    "branch": "develop"
  },
  "status": "in_progress",
  "created_at": "2023-04-01T15:30:00Z",
  "estimated_completion_time": "2023-04-01T15:35:00Z"
}
```

## Additional Endpoints

The WP Engine Customer API provides many more endpoints for managing various aspects of your WordPress sites. For detailed documentation on all available endpoints, please refer to the specific sections:

- [Domains](/api-reference/endpoints/domains/)
- [SSL Certificates](/api-reference/endpoints/ssl/)
- [Users](/api-reference/endpoints/users/)
- [Environments](/api-reference/endpoints/environments/)
- [Logs](/api-reference/endpoints/logs/)
- [Metrics](/api-reference/endpoints/metrics/)

## Next Steps

- Learn about [Authentication](/api-reference/authentication/)
- Understand [Pagination](/api-reference/pagination/)
- Try the [Quick Start Guide](/getting-started/quick-start/)
- Explore the [API Explorer](/api-reference/explorer/)
