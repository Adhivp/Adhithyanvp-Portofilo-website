/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

const path = require('path');
const _ = require('lodash');
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  // Define template paths
  const indexTemplate = path.resolve(`./src/templates/index-template.js`);
  const projectsArchiveTemplate = path.resolve(`./src/templates/projects-archive-template.js`);
  const eventsArchiveTemplate = path.resolve(`./src/templates/events-archive-template.js`);
  // Add more templates as needed

  // Fetch data from Strapi
  const result = await graphql(`
    {
      allStrapiProject {
        nodes {
          id
          featured
          showInProjects
        }
      }
      allStrapiJob {
        nodes {
          id
        }
      }
      allStrapiEvent {
        nodes {
          id
        }
      }
    }
  `);

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.');
    return;
  }

  // Define page data as necessary (e.g., slug generation if needed)
  // Since data fetching is moved to components, minimal context is needed

  // Create Homepage without passing context data
  createPage({
    path: '/',
    component: indexTemplate,
    context: {}, // Empty context since components fetch their own data
  });

  // Create Projects Archive Page
  createPage({
    path: '/projects-archive',
    component: projectsArchiveTemplate,
    context: {}, // Components will handle their own data fetching
  });

  // Create Events Archive Page
  createPage({
    path: '/events-archive',
    component: eventsArchiveTemplate,
    context: {}, // Components will handle their own data fetching
  });

  // Add more page creations as needed without passing context data
};

// Webpack Configuration (Optional)
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // Fixing third-party modules during build
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /scrollreveal/,
            use: loaders.null(),
          },
          {
            test: /animejs/,
            use: loaders.null(),
          },
          {
            test: /miniraf/,
            use: loaders.null(),
          },
        ],
      },
    });
  }

  // Alias configurations
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@fonts': path.resolve(__dirname, 'src/fonts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@templates': path.resolve(__dirname, 'src/templates'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
  });
};
