import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new transaction.
 */
export const createTransactionValidator = vine.compile(
  vine.object({
    amount: vine.number(),
    name: vine.string(),
    day: vine.number(),
    collected: vine.boolean(),
    type: vine.enum(['RECURRING', 'ONE_TIME', 'REFUND', 'WAGE']),
    archived: vine.boolean(),
    category_id: vine.string(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing transaction.
 */
export const updateTransactionValidator = vine.compile(vine.object({}))

export const wageValidator = vine.compile(vine.object({ amount: vine.number() }))

export const toggleCollectedTransactionValidator = vine.compile(vine.object({ id: vine.string() }))
