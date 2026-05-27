import type { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whitelist = [process.env.FRONTEND_URL, process.env.BACKEND_URL];

    // Triggers locally for development, or on Render for origin-less calls (Swagger UI)
    if (process.env.NODE_ENV === 'development' || (!origin && process.env.NODE_ENV !== 'development')) {
      whitelist.push(undefined);
    }

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
};
