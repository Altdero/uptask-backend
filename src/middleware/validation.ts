import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

type SchemaMap = {
  body?: z.ZodType;
  params?: z.ZodType;
};

export const validate = (schemas: SchemaMap) => (req: Request, res: Response, next: NextFunction) => {
  const issues: { path: (string | number | symbol)[]; message: string }[] = [];

  if (schemas.body) {
    const result = schemas.body.safeParse(req.body);
    if (!result.success) {
      issues.push(...result.error.issues.map(({ path, message }) => ({ path, message })));
    } else {
      req.body = result.data;
    }
  }

  if (schemas.params) {
    const result = schemas.params.safeParse(req.params);
    if (!result.success) {
      issues.push(...result.error.issues.map(({ path, message }) => ({ path, message })));
    }
  }

  if (issues.length > 0) return res.status(400).json({ errors: issues });
  next();
};
