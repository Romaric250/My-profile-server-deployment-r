import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema Zod schema to validate against
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Format Zod errors for better readability
        const formattedErrors = result.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }));

        logger.warn(`Validation failed for ${req.path}:`, formattedErrors);

        // Create a more descriptive error message
        const errorMessage = formattedErrors.length === 1
          ? `Validation failed: ${formattedErrors[0].message}`
          : `Validation failed: ${formattedErrors.length} errors found`;

        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: formattedErrors
        });
      }

      // If validation passes, update req.body with parsed data
      req.body = result.data;
      next();
    } catch (error: any) {
      logger.error(`Validation error: ${error.message}`, { error });
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to handle express-validator validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      path: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));

    logger.warn(`Validation failed for ${req.path}:`, formattedErrors);

    const errorMessage = formattedErrors.length === 1
      ? `Validation failed: ${formattedErrors[0].message}`
      : `Validation failed: ${formattedErrors.length} errors found`;

    return res.status(400).json({
      success: false,
      message: errorMessage,
      errors: formattedErrors
    });
  }

  next();
};
