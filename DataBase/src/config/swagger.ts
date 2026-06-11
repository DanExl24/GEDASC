import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GEDASC API Documentation',
      version: '1.0.0',
      description: 'Documentación oficial de la API del sistema GEDASC (Gestión de Entradas y Salidas de Aprendices del Centro)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/index.ts'], // Rutas donde están los JSDoc
};

export const swaggerSpec = swaggerJSDoc(options);
