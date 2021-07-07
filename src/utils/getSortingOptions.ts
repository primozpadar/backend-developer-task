import { Request } from 'express';

export type OrderType = 'ASC' | 'DESC';

/**
 * Get sorting options from request
 * Type cheking **MUST** be done in middleware. This functions only casts type to OrderType
 * @param {Request} req express request
 * @returns {Object} sorting options
 */
export function getSortingOptions(req: Request) {
  // type is checked in middleware
  const shared = req.query.shared as OrderType;
  const heading = req.query.heading as OrderType;

  return { shared, heading };
}
