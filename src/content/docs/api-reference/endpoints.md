---
title: API Endpoints
description: Complete reference for all WP Engine Customer API endpoints
---

# API Endpoints

This page documents all available endpoints in the WP Engine Customer API. For general API information, see the [API Overview](/api-reference/overview/). For authentication details, see [Authentication](/api-reference/authentication/). For information about working with paginated responses, see [Pagination](/api-reference/pagination/).

## Status

### Get API Status
`GET /status`

Returns the current status of the WP Engine Public API.

#### Response

##### 200 Success
```json
{
  "success": true,
  "created_on": "2023-05-17T16:20:40+00:00"
}
```

##### Error Responses
- 429: Too Many Requests
- 503: Service Unavailable

### Get Swagger Specification
`GET /swagger`

Returns the current swagger specification.

#### Response

##### 200 Success
Returns the current swagger specification

##### Error Responses
- 429: Too Many Requests
- 503: Service Unavailable

## Accounts

### List Accounts
`GET /accounts`

Returns a list of WP Engine accounts you have access to.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| limit | integer | query | no | Number of records to return (default: 100, max: 100) |
| offset | integer | query | no | Number of records to skip (default: 0) |

#### Response

##### 200 Success
```json
{
  "previous": "https://api.wpengineapi.com/v1/accounts?limit=100&offset=0",
  "next": "https://api.wpengineapi.com/v1/accounts?limit=100&offset=200",
  "count": 225,
  "results": [
    {
      "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
      "name": "joesaccount"
    }
  ]
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 429: Too Many Requests
- 503: Service Unavailable

### Get Account
`GET /accounts/{account_id}`

Returns details for a single account.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| account_id | string (uuid) | path | yes | ID of account |

#### Response

##### 200 Success
```json
{
  "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
  "name": "joesaccount"
}
```

##### Error Responses
- 401: Authentication Error
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

## Account Users

### List Account Users
`GET /accounts/{account_id}/account_users`

Returns a list of users associated with an account.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| account_id | string (uuid) | path | yes | ID of account |

#### Response

##### 200 Success
```json
{
  "results": [
    {
      "user_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
      "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
      "first_name": "Joe",
      "last_name": "Smith",
      "email": "joeSmith@test.com",
      "phone": "1234567890",
      "invite_accepted": false,
      "mfa_enabled": true,
      "roles": "billing, partial"
    }
  ]
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 429: Too Many Requests
- 503: Service Unavailable

### Create Account User
`POST /accounts/{account_id}/account_users`

Creates a new user in an account.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| account_id | string (uuid) | path | yes | ID of account |

#### Request Body

```json
{
  "user": {
    "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
    "first_name": "Joe",
    "last_name": "Smith",
    "email": "joe@gmail.com",
    "roles": "full,billing",
    "install_ids": [
      "ddda3227-9a39-46ae-9e14-20958bb4e6c9",
      "qada3227-9a39-46ae-9e14-20958bb4e45y"
    ]
  }
}
```

#### Response

##### 201 Created
```json
{
  "message": "Your change was successful.",
  "account_user": {
    "user_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
    "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
    "first_name": "Joe",
    "last_name": "Smith",
    "email": "joe@gmail.com",
    "roles": "full,billing"
  }
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Get Account User
`GET /accounts/{account_id}/account_users/{user_id}`

Returns details for a single account user.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| account_id | string (uuid) | path | yes | ID of account |
| user_id | string (uuid) | path | yes | ID of user |

#### Response

##### 200 Success
```json
{
  "user_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
  "first_name": "Joe",
  "last_name": "Smith",
  "email": "joe@gmail.com",
  "roles": "full,billing"
}
```

##### Error Responses
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Update Account User
`PATCH /accounts/{account_id}/account_users/{user_id}`

Updates an existing account user.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| account_id | string (uuid) | path | yes | ID of account |
| user_id | string (uuid) | path | yes | ID of user |

#### Request Body

```json
{
  "roles": "full,billing",
  "install_ids": [
    "ddda3227-9a39-46ae-9e14-20958bb4e6c9",
    "qada3227-9a39-46ae-9e14-20958bb4e45y"
  ]
}
```

#### Response

##### 200 Success
```json
{
  "message": "Your change was successful.",
  "account_user": {
    "user_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
    "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
    "first_name": "Joe",
    "last_name": "Smith",
    "email": "joe@gmail.com",
    "roles": "full,billing"
  }
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

### Delete Account User
`DELETE /accounts/{account_id}/account_users/{user_id}`

Removes a user from an account. This action is permanent and cannot be undone.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| account_id | string (uuid) | path | yes | ID of account |
| user_id | string (uuid) | path | yes | ID of user |

#### Response

##### 204 No Content
Successfully deleted

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

## Sites

### List Sites
`GET /sites`

Returns a list of sites you have access to.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| limit | integer | query | no | Number of records to return (default: 100, max: 100) |
| offset | integer | query | no | Number of records to skip (default: 0) |
| account_id | string (uuid) | query | no | Filter sites by account ID |

#### Response

##### 200 Success
```json
{
  "previous": null,
  "next": "https://api.wpengineapi.com/v1/sites?limit=100&offset=100",
  "count": 150,
  "results": [
    {
      "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
      "name": "Torque Magazine",
      "account": {
        "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
      }
    }
  ]
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 429: Too Many Requests
- 503: Service Unavailable

### Create Site
`POST /sites`

Creates a new site.

#### Request Body

```json
{
  "name": "Torque Magazine",
  "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
}
```

#### Response

##### 201 Created
```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "name": "Torque Magazine",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  }
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Get Site
`GET /sites/{site_id}`

Returns details for a single site.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| site_id | string (uuid) | path | yes | The site ID |

#### Response

##### 200 Success
```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "name": "Torque Magazine",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  }
}
```

##### Error Responses
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Update Site
`PATCH /sites/{site_id}`

Updates a site's name.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| site_id | string (uuid) | path | yes | The site ID |

#### Request Body

```json
{
  "name": "My New Name"
}
```

#### Response

##### 200 Success
```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "name": "My New Name",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  }
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Delete Site
`DELETE /sites/{site_id}`

Deletes a site and all associated installs. This action is permanent and cannot be undone.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| site_id | string (uuid) | path | yes | The site ID |

#### Response

##### 204 No Content
Successfully deleted

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

## Installs

### List Installs
`GET /installs`

Returns a list of WordPress installations you have access to.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| limit | integer | query | no | Number of records to return (default: 100, max: 100) |
| offset | integer | query | no | Number of records to skip (default: 0) |
| account_id | string (uuid) | query | no | Filter installs by account ID |

#### Response

##### 200 Success
```json
{
  "previous": null,
  "next": "https://api.wpengineapi.com/v1/installs?limit=100&offset=100",
  "count": 150,
  "results": [
    {
      "id": "294deacc-d8b8-4005-82c4-0727ba8ddde0",
      "name": "torquemag",
      "account": {
        "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
      },
      "php_version": "7.4",
      "status": "active",
      "cname": "torquemag.wpengine.com",
      "environment": "production"
    }
  ]
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 429: Too Many Requests
- 503: Service Unavailable

### Create Install
`POST /installs`

Creates a new WordPress installation.

#### Request Body

```json
{
  "name": "torquemag",
  "account_id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9",
  "site_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "environment": "staging"
}
```

#### Response

##### 201 Created
```json
{
  "id": "294deacc-d8b8-4005-82c4-0727ba8ddde0",
  "name": "torquemag",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  },
  "php_version": "7.4",
  "status": "pending",
  "site": {
    "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d"
  },
  "environment": "staging"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Get Install
`GET /installs/{install_id}`

Returns details for a single WordPress installation.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |

#### Response

##### 200 Success
```json
{
  "id": "294deacc-d8b8-4005-82c4-0727ba8ddde0",
  "name": "torquemag",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  },
  "php_version": "7.4",
  "status": "active",
  "site": {
    "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d"
  },
  "environment": "staging"
}
```

##### Error Responses
- 401: Authentication Error
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Update Install
`PATCH /installs/{install_id}`

Updates a WordPress installation.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | The install ID |

#### Request Body

```json
{
  "site_id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "environment": "development"
}
```

#### Response

##### 200 Success
```json
{
  "id": "294deacc-d8b8-4005-82c4-0727ba8ddde0",
  "name": "torquemag",
  "account": {
    "id": "eeda3227-9a39-46ae-9e14-20958bb4e6c9"
  },
  "site": {
    "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d"
  },
  "environment": "development"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Delete Install
`DELETE /installs/{install_id}`

Deletes a WordPress installation. This action is permanent and cannot be undone.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |

#### Response

##### 204 No Content
Successfully deleted

##### Error Responses
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

## Domains

### List Domains
`GET /installs/{install_id}/domains`

Returns a list of domains for a specific install.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |
| limit | integer | query | no | Number of records to return (default: 100, max: 100) |
| offset | integer | query | no | Number of records to skip (default: 0) |

#### Response

##### 200 Success
```json
{
  "previous": null,
  "next": null,
  "count": 2,
  "results": [
    {
      "name": "example.com",
      "duplicate": false,
      "primary": true,
      "id": "e41fa98f-ea80-4654-b229-a9b765d0863a"
    }
  ]
}
```

##### Error Responses
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Add Domain
`POST /installs/{install_id}/domains`

Adds a new domain or redirect to an install.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |

#### Request Body

```json
{
  "name": "example.com",
  "primary": true
}
```

#### Response

##### 201 Created
```json
{
  "name": "example.com",
  "duplicate": false,
  "primary": true,
  "id": "e41fa98f-ea80-4654-b229-a9b765d0863a"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Add Multiple Domains
`POST /installs/{install_id}/domains/bulk`

Adds multiple domains and redirects to an install.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |

#### Request Body

```json
{
  "domains": [
    {
      "name": "example.com"
    },
    {
      "name": "www.example.com",
      "redirect_to": "example.com"
    }
  ]
}
```

#### Response

##### 201 Created
```json
{
  "domains": [
    {
      "name": "example.com",
      "duplicate": false,
      "primary": false,
      "id": "e41fa98f-ea80-4654-b229-a9b765d0863a"
    },
    {
      "name": "www.example.com",
      "duplicate": false,
      "primary": false,
      "id": "f52gb98f-ea80-4654-b229-a9b765d0863b",
      "redirects_to": {
        "name": "example.com",
        "id": "e41fa98f-ea80-4654-b229-a9b765d0863a"
      }
    }
  ]
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Get Domain
`GET /installs/{install_id}/domains/{domain_id}`

Returns details for a specific domain.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |
| domain_id | string (uuid) | path | yes | ID of domain |

#### Response

##### 200 Success
```json
{
  "name": "example.com",
  "duplicate": false,
  "primary": true,
  "id": "e41fa98f-ea80-4654-b229-a9b765d0863a"
}
```

##### Error Responses
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Update Domain
`PATCH /installs/{install_id}/domains/{domain_id}`

Updates a domain's settings.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |
| domain_id | string (uuid) | path | yes | ID of domain |

#### Request Body

```json
{
  "primary": true,
  "redirect_to": "6977805b-1f65-4a5d-8d36-6fe609a4d9f3"
}
```

#### Response

##### 200 Success
```json
{
  "name": "example.com",
  "duplicate": false,
  "primary": true,
  "id": "e41fa98f-ea80-4654-b229-a9b765d0863a"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Delete Domain
`DELETE /installs/{install_id}/domains/{domain_id}`

Removes a domain from an install.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |
| domain_id | string (uuid) | path | yes | ID of domain |

#### Response

##### 204 No Content
Successfully deleted

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Check Domain Status
`POST /installs/{install_id}/domains/{domain_id}/check_status`

Checks the status of a domain.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |
| domain_id | string (uuid) | path | yes | ID of domain |

#### Response

##### 200 Success
Returns the domain status

##### 202 Accepted
Request accepted, check back later

##### Error Responses
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests (Rate limited to one request every 5 seconds per install)
- 500: Internal Server Error
- 503: Service Unavailable

## Backups

### Create Backup
`POST /installs/{install_id}/backups`

Creates a new backup of a WordPress installation.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |

#### Request Body

```json
{
  "description": "Taking a backup before new feature development",
  "notification_emails": [
    "myself@example.com",
    "team@example.com"
  ]
}
```

#### Response

##### 202 Accepted
```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "status": "requested"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

### Get Backup Status
`GET /installs/{install_id}/backups/{backup_id}`

Returns the status of a backup.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |
| backup_id | string (uuid) | path | yes | ID of backup |

#### Response

##### 200 Success
```json
{
  "id": "28c78b6d-c2da-4f09-85f5-1ad588089b2d",
  "status": "completed"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 404: Not Found
- 429: Too Many Requests
- 503: Service Unavailable

## Cache

### Purge Cache
`POST /installs/{install_id}/purge_cache`

Purges the specified cache for an install.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| install_id | string (uuid) | path | yes | ID of install |

#### Request Body

```json
{
  "type": "object"
}
```

The `type` field must be one of:
- `object`: Purge object cache
- `page`: Purge page cache
- `cdn`: Purge CDN cache

#### Response

##### 202 Accepted
Request accepted

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 404: Not Found
- 429: Too Many Requests (Rate limited to one request every 60 seconds per install)
- 503: Service Unavailable

## User

### Get Current User
`GET /user`

Returns information about the currently authenticated user.

#### Response

##### 200 Success
```json
{
  "id": "fd8e24a5-1f16-4b80-af5f-d748bcc9e64d",
  "first_name": "Joe",
  "last_name": "Smith",
  "email": "joe@gmail.com",
  "phone_number": "123456789"
}
```

##### Error Responses
- 401: Authentication Error
- 429: Too Many Requests
- 503: Service Unavailable

## SSH Keys

### List SSH Keys
`GET /ssh_keys`

Returns a list of SSH keys associated with your account.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| limit | integer | query | no | Number of records to return (default: 100, max: 100) |
| offset | integer | query | no | Number of records to skip (default: 0) |

#### Response

##### 200 Success
```json
{
  "previous": null,
  "next": null,
  "count": 1,
  "results": [
    {
      "comment": "joe@gmail.com",
      "created_at": "2019-09-01T15:59:24.277Z",
      "fingerprint": "a1:b2:c3:d4:e5:46:a7:88:c9:40:d2:d7:9b:cd:42:05",
      "uuid": "e41fa98f-ea80-1f16-a7b7-d748bcc9e64d"
    }
  ]
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 429: Too Many Requests
- 503: Service Unavailable

### Add SSH Key
`POST /ssh_keys`

Adds a new SSH key to your account.

#### Request Body

```json
{
  "public_key": "ssh-rsa AAAAbcdefg+567te/4i9ASKGHtw9euaskl+Iksldfjw== joe@gmail.com"
}
```

#### Response

##### 201 Created
```json
{
  "comment": "joe@gmail.com",
  "created_at": "2019-09-01T15:59:24.277Z",
  "fingerprint": "a1:b2:c3:d4:e5:46:a7:88:c9:40:d2:d7:9b:cd:42:05",
  "uuid": "e41fa98f-ea80-1f16-a7b7-d748bcc9e64d"
}
```

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too Many Requests
- 503: Service Unavailable

### Delete SSH Key
`DELETE /ssh_keys/{ssh_key_id}`

Removes an SSH key from your account.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|------|----------|-------------|
| ssh_key_id | string (uuid) | path | yes | ID of SSH key |

#### Response

##### 204 No Content
Successfully deleted

##### Error Responses
- 400: Bad Request
- 401: Authentication Error
- 403: Not Authorized
- 429: Too
