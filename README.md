# WP Engine Customer API Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This repository contains the documentation for the WP Engine Customer API, built using [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## 🚀 Project Structure

```
.
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and other assets
│   ├── components/         # Custom Astro components
│   │   └── Head.astro      # Custom head component
│   ├── content/
│   │   └── docs/           # Documentation content (Markdown)
│   │       ├── getting-started/
│   │       ├── api-reference/
│   │       ├── guides/
│   │       └── examples/
│   └── styles/
│       └── custom.css      # Custom CSS styles
├── astro.config.mjs        # Astro configuration
├── package.json
└── tsconfig.json
```

## 📚 Documentation Structure

The documentation follows a clear structure:

- **Getting Started**: Introduction, authentication, and quick start guides
- **API Reference**: Detailed technical reference for the API
- **Guides**: How-to guides for common tasks
- **Examples**: Complete code examples

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🎨 Customization

The documentation site uses WP Engine branding colors and styles. These can be customized in:

- `src/styles/custom.css`: Custom CSS variables and styles
- `astro.config.mjs`: Starlight configuration, including sidebar structure

## 🚀 Deployment

The documentation site is designed to be deployed to WP Engine's Node.js infrastructure. The build process generates static HTML files that can be served from any web server.

## 👥 Contributing

Contributions to the documentation are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
