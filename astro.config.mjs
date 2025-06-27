// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [
      starlight({
          title: 'WP Engine Customer API',
          description: 'Documentation for the WP Engine Customer API',
          customCss: [
              // Path to your custom CSS file
              './src/styles/custom.css',
          ],
          sidebar: [
              {
                  label: 'Getting Started',
                  items: [
                      { label: 'Introduction', slug: 'getting-started/introduction' },
                      { label: 'Authentication', slug: 'getting-started/authentication' },
                      { label: 'Quick Start', slug: 'getting-started/quick-start' },
                  ],
              },
                            {
                  label: 'API Reference',
                  items: [
                  { label: 'Overview', link: '/api-reference/overview/' },
                  { label: 'Authentication', link: '/api-reference/authentication/' },
                  { label: 'Pagination', link: '/api-reference/pagination/' },
                  {
                      label: 'Endpoints',
                      collapsed: false,
                      items: [
                      { label: 'All Endpoints', link: '/api-reference/endpoints/' },
                      {
                          label: 'Status',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/status/' },
                          { label: 'The status of the WP Engine Public API', link: '/api-reference/endpoints/status/status/' }
                          ]
                      },
                      {
                          label: 'Swagger',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/swagger/' },
                          { label: 'The current swagger specification', link: '/api-reference/endpoints/swagger/swagger/' }
                          ]
                      },
                      {
                          label: 'Account',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/account/' },
                          { label: 'List your WP Engine accounts', link: '/api-reference/endpoints/account/list-accounts/' },
                          { label: 'Get an account by ID', link: '/api-reference/endpoints/account/get-account/' }
                          ]
                      },
                      {
                          label: 'Account User',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/account-user/' },
                          { label: 'List your account users', link: '/api-reference/endpoints/account-user/list-account-users/' },
                          { label: 'Create a new account user', link: '/api-reference/endpoints/account-user/create-account-user/' },
                          { label: 'Get an account user by ID', link: '/api-reference/endpoints/account-user/get-account-user/' },
                          { label: 'Update an account user', link: '/api-reference/endpoints/account-user/update-account-user/' },
                          { label: 'Delete an account user', link: '/api-reference/endpoints/account-user/delete-account-user/' }
                          ]
                      },
                      {
                          label: 'Site',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/site/' },
                          { label: 'List your sites', link: '/api-reference/endpoints/site/list-sites/' },
                          { label: 'Create a new site', link: '/api-reference/endpoints/site/create-site/' },
                          { label: 'Get a site by ID', link: '/api-reference/endpoints/site/get-site/' },
                          { label: 'Change a site name', link: '/api-reference/endpoints/site/update-site/' },
                          { label: 'Delete a site', link: '/api-reference/endpoints/site/delete-site/' }
                          ]
                      },
                      {
                          label: 'Install',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/install/' },
                          { label: 'List your WordPress installations', link: '/api-reference/endpoints/install/list-installs/' },
                          { label: 'Create a new WordPress installation', link: '/api-reference/endpoints/install/create-install/' },
                          { label: 'Get an install by ID', link: '/api-reference/endpoints/install/get-install/' },
                          { label: 'Delete an install by ID', link: '/api-reference/endpoints/install/delete-install/' },
                          { label: 'Update a WordPress installation', link: '/api-reference/endpoints/install/update-install/' }
                          ]
                      },
                      {
                          label: 'Offload Settings',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/offload-settings/' },
                          { label: 'Get the validation file needed to configure LargeFS', link: '/api-reference/endpoints/offload-settings/get-large-fsvalidation-file/' },
                          { label: 'Get the offload settings for an install', link: '/api-reference/endpoints/offload-settings/get-offload-settings/' },
                          { label: 'Configure offload settings for an install', link: '/api-reference/endpoints/offload-settings/update-offload-settings/' },
                          { label: 'Update specific offload settings for an install', link: '/api-reference/endpoints/offload-settings/patch-offload-settings/' }
                          ]
                      },
                      {
                          label: 'Domain',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/domain/' },
                          { label: 'Get the domains for an install by install id', link: '/api-reference/endpoints/domain/list-domains/' },
                          { label: 'Add a new domain or redirect to an existing install', link: '/api-reference/endpoints/domain/create-domain/' },
                          { label: 'Add multiple domains and redirects to an existing install', link: '/api-reference/endpoints/domain/create-bulk-domains/' },
                          { label: 'Get a specific domain for an install', link: '/api-reference/endpoints/domain/get-domain/' },
                          { label: 'Update an existing domain for an install', link: '/api-reference/endpoints/domain/update-domain/' },
                          { label: 'Delete a specific domain for an install', link: '/api-reference/endpoints/domain/delete-domain/' },
                          { label: 'Submit a status report for a domain', link: '/api-reference/endpoints/domain/check-status/' },
                          { label: 'Retrieve a status report for a domain', link: '/api-reference/endpoints/domain/get-domain-report-status/' }
                          ]
                      },
                      {
                          label: 'Certificates',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/certificates/' },
                          { label: 'Get SSL certificate information for a domain', link: '/api-reference/endpoints/certificates/get-domain-certificate/' }
                          ]
                      },
                      {
                          label: 'Backup',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/backup/' },
                          { label: 'Requests a new backup of a WordPress installation', link: '/api-reference/endpoints/backup/create-backup/' },
                          { label: 'Retrieves the status of a backup of a WordPress installation', link: '/api-reference/endpoints/backup/show-backup/' }
                          ]
                      },
                      {
                          label: 'Cache',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/cache/' },
                          { label: 'Purge an install\'s cache', link: '/api-reference/endpoints/cache/purge-cache/' }
                          ]
                      },
                      {
                          label: 'User',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/user/' },
                          { label: 'Get the current user', link: '/api-reference/endpoints/user/get-current-user/' }
                          ]
                      },
                      {
                          label: 'Ssh Key',
                          collapsed: true,
                          items: [
                          { label: 'Overview', link: '/api-reference/endpoints/ssh-key/' },
                          { label: 'Get your SSH keys', link: '/api-reference/endpoints/ssh-key/list-ssh-keys/' },
                          { label: 'Add a new SSH key', link: '/api-reference/endpoints/ssh-key/create-ssh-key/' },
                          { label: 'Delete an existing SSH key', link: '/api-reference/endpoints/ssh-key/delete-ssh-key/' }
                          ]
                      }
                      ]
                  }
                  ]
              },
              {
                  label: 'Try!',
                  items: [
                      { label: 'API Playground', slug: 'try/playground' },
                  ],
              },
          ],
          components: {
              // Override built-in components with custom ones
              Head: './src/components/Head.astro',
          },
      }),
	],

  adapter: node({
    mode: 'standalone',
  }),
});
