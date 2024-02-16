import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when updating the user's onboarding status.
 */
export const onboardingStatusValidator = vine.compile(
  vine.object({
    onboardingStatus: vine.enum(['WELCOME', 'AMOUNT_ON_ACCOUNT', 'RECURRING', 'ONBOARDED']),
  })
)

export const onboardingBalanceValidator = vine.compile(vine.object({ balance: vine.number() }))

export const onboardingRecurringTransactionsValidator = vine.compile(
  vine.object({
    transactions: vine.array(
      vine.object({
        name: vine.string(),
        amount: vine.number(),
        day: vine.number(),
      })
    ),
  })
)
