/**
 * Request Validation Middleware using Zod
 * 
 * Usage:
 * const schema = z.object({
 *   body: z.object({ ... }),
 *   query: z.object({ ... }),
 *   params: z.object({ ... })
 * })
 * router.post('/endpoint', validate(schema), handler)
 */

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  })

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: result.error.flatten()
      }
    })
  }

  // Attach validated data to request
  req.valid = result.data
  next()
}

module.exports = { validate }



