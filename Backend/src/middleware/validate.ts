import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                sendError(res, 'Validation Error', 400, formattedErrors);
                return;
            }
            sendError(res, 'Internal Server Error', 500);
            return;
        }
    };
};
