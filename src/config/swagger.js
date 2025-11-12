const swaggerJsdoc = require('swagger-jsdoc');

// Déterminer l'URL du serveur selon l'environnement
const getServerUrl = () => {
  if (process.env.RENDER_EXTERNAL_URL) {
    // Sur Render, utiliser l'URL fournie
    return process.env.RENDER_EXTERNAL_URL;
  }
  if (process.env.NODE_ENV === 'production' && process.env.API_URL) {
    // URL de production personnalisée
    return process.env.API_URL;
  }
  // Développement local
  return `http://localhost:${process.env.PORT || 3000}`;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Service Client API - DeliveCROUS',
      version: '1.0.0',
      description: 'API pour le Module 2 : Service Client - Gestion des tickets et messages',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

