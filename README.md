# Astro News Site with Server-Side Rendering

A modern news site built with Astro and configured for server-side rendering on Vercel. This project uses the ArcXP Content API to fetch and display news articles.

![News Site Screenshot](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

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

## 🚀 Deploying to Vercel

This project is configured for deployment on Vercel with server-side rendering. Follow these steps to deploy:

1. **Push your code to a GitHub repository**

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com) and sign in with GitHub
   - Click "New Project" and import your repository
   - Select the "Astro" framework preset (Vercel should auto-detect it)

3. **Configure Environment Variables**
   - Add the following environment variables in the Vercel project settings:
     - `ARC_ORG`: Your ArcXP organization name
     - `ARC_ENV`: Your ArcXP environment (e.g., sandbox, production)
     - `ARC_DEVCENTER_TOKEN`: Your ArcXP API token

4. **Deploy**
   - Click "Deploy" and wait for the build to complete

5. **Verify**
   - Once deployed, verify that your site is working correctly
   - Test article pages to ensure server-side rendering is working properly

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
