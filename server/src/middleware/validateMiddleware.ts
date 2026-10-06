import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Controllers must receive normalized values and schema defaults.
      if (parsed.body !== undefined) req.body = parsed.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));
        errorResponse(
          res,
          errorMessages[0]?.message || 'Dữ liệu không hợp lệ',
          422,
          errorMessages
        );
        return;
      }
      errorResponse(res, 'Lỗi xử lý xác thực dữ liệu', 500, error);
    }
  };

export default validate;
