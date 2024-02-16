import db from '@adonisjs/lucid/services/db'
import { HttpContext } from '@adonisjs/core/http'
import {
  onboardingBalanceValidator,
  onboardingRecurringTransactionsValidator,
  onboardingStatusValidator,
} from '#validators/user'
import { v4 as uuidv4 } from 'uuid'

export default class UserService {
  async all({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 20

    const users = await db
      .query()
      .from('users')
      .select('*')
      .orderBy('updated_at', 'desc')
      .paginate(page, limit)

    return users
  }

  async updateOnboardingStatus({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = request.all()

    const onboardingStatus = await onboardingStatusValidator.validate(data)

    user.onboarding_status = onboardingStatus.onboardingStatus
    if (onboardingStatus.onboardingStatus === 'ONBOARDED') {
      user.is_onboarded = true
    }
    await user.save()
    return response.json({
      onboardingStatus: user.onboarding_status,
      isOnboarded: user.is_onboarded,
    })
  }

  async updateBalance({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = request.all()
    const balanceValidation = await onboardingBalanceValidator.validate(data)

    user.balance = balanceValidation.balance
    await user.save()
    return response.json({ balance: user.balance })
  }

  async updateRecurringTransactions({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = request.all()

    const recurringTransactionValidation =
      await onboardingRecurringTransactionsValidator.validate(data)

    const transactionsToInsert = recurringTransactionValidation.transactions.map(
      (transactionPart) => ({
        ...transactionPart,
        id: uuidv4(), // multiInsert does not handle the @beforeCreate hook, so we need to generate it
        collected: true,
        type: 'RECURRING',
        archived: false,
        user_id: user.id,
        category_id: '8fbd6c98-cc0f-11ee-9489-325096b39f47',
      })
    )

    await db.table('transactions').multiInsert(transactionsToInsert)

    return response.json(true)
  }
}
