import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UpTask API',
      version: '1.0.0',
      description: 'REST API for UpTask — a Jira-like project management application',
    },
    // Dynamically routes requests depending on your runtime environment
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:4000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Local Environment',
      },
    ],
    tags: [{ name: 'Auth' }, { name: 'Projects' }, { name: 'Tasks' }, { name: 'Team' }, { name: 'Notes' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'array', items: { type: 'string' } },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            confirmed: { type: 'boolean', example: true },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            projectName: { type: 'string', example: 'Website Redesign' },
            clientName: { type: 'string', example: 'Acme Corp' },
            description: { type: 'string', example: 'Full redesign of the corporate website' },
            manager: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            tasks: { type: 'array', items: { type: 'string' } },
            team: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            name: { type: 'string', example: 'Design mockups' },
            description: { type: 'string', example: 'Create wireframes and high-fidelity mockups' },
            project: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            status: { type: 'string', enum: ['pending', 'onHold', 'inProgress', 'underReview', 'completed'], example: 'pending' },
            completedBy: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                  status: { type: 'string', enum: ['pending', 'onHold', 'inProgress', 'underReview', 'completed'] },
                },
              },
            },
            notes: { type: 'array', items: { $ref: '#/components/schemas/Note' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Note: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            content: { type: 'string', example: 'Remember to check the brand guidelines' },
            createdBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            task: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
