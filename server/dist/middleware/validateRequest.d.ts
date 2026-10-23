import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare function validateRequest(schema: ZodSchema, source?: 'body' | 'query' | 'params'): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validateRequest.d.ts.map