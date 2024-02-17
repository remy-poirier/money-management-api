import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export default class StatisticsService {
  async all({ response, auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }

    const user = await User.find(userId)

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    const balance = user.balance

    const oneTimeCollectedSumQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'ONE_TIME')
      .where('collected', true)
      .sum('amount as total')
      .first()

    const oneTimeNotCollectedSumQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'ONE_TIME')
      .where('collected', false)
      .sum('amount as total')
      .first()

    const refundsCollectedSumQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'REFUND')
      .where('collected', true)
      .sum('amount as total')
      .first()

    const refundsNotCollectedSumQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'REFUND')
      .where('collected', false)
      .sum('amount as total')
      .first()

    const recurringCollectedSumQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'RECURRING')
      .where('collected', true)
      .sum('amount as total')
      .first()

    const recurringNotCollectedSumQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'RECURRING')
      .where('collected', false)
      .sum('amount as total')
      .first()

    const countRefundsCollectedQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'REFUND')
      .where('collected', true)
      .count('* as total')
      .first()

    const countRefundsNotCollectedQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'REFUND')
      .where('collected', false)
      .count('* as total')
      .first()

    const countOneTimeCollectedQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'ONE_TIME')
      .where('collected', true)
      .count('* as total')
      .first()

    const countOneTimeNotCollectedQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'ONE_TIME')
      .where('collected', false)
      .count('* as total')
      .first()

    const countRecurringCollectedQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'RECURRING')
      .where('collected', true)
      .count('* as total')
      .first()

    const countRecurringNotCollectedQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', 'RECURRING')
      .where('collected', false)
      .count('* as total')
      .first()

    const countTotalTransctionsQ = await db
      .from('transactions')
      .where('user_id', userId)
      .where('archived', false)
      .where('type', '!=', 'WAGE')
      .count('* as total')
      .first()

    const refundsCollectedSum = refundsCollectedSumQ.total ?? 0
    const refundsNotCollectedSum = refundsNotCollectedSumQ.total ?? 0

    const recurringCollectedSum = recurringCollectedSumQ.total ?? 0
    const recurringNotCollectedSum = recurringNotCollectedSumQ.total ?? 0

    const oneTimeCollectedSum = oneTimeCollectedSumQ.total ?? 0
    const oneTimeNotCollectedSum = oneTimeNotCollectedSumQ.total ?? 0

    // Count transactions
    const countRefundsCollected = Number.parseInt(countRefundsCollectedQ.total) ?? 0
    const countRefundsNotCollected = Number.parseInt(countRefundsNotCollectedQ.total) ?? 0

    const countOneTimeCollected = Number.parseInt(countOneTimeCollectedQ.total) ?? 0
    const countOneTimeNotCollected = Number.parseInt(countOneTimeNotCollectedQ.total) ?? 0

    const countRecurringCollected = Number.parseInt(countRecurringCollectedQ.total) ?? 0
    const countRecurringNotCollected = Number.parseInt(countRecurringNotCollectedQ.total) ?? 0

    const countTotalTransctions = Number.parseInt(countTotalTransctionsQ.total) ?? 0

    return response.json({
      totalToCome: +(
        refundsNotCollectedSum -
        oneTimeNotCollectedSum -
        recurringNotCollectedSum
      ).toFixed(2),
      amountLeftForMonth: +(
        balance +
        refundsNotCollectedSum -
        oneTimeNotCollectedSum -
        recurringNotCollectedSum
      ).toFixed(2),
      refunds: {
        collected: +refundsCollectedSum.toFixed(2),
        toCome: +refundsNotCollectedSum.toFixed(2),
        total: +(refundsCollectedSum + refundsNotCollectedSum).toFixed(2),
      },
      oneTime: {
        collected: +oneTimeCollectedSum.toFixed(2),
        toCome: +oneTimeNotCollectedSum.toFixed(2),
        total: +(oneTimeCollectedSum + oneTimeNotCollectedSum).toFixed(2),
      },
      recurring: {
        collected: +recurringCollectedSum.toFixed(2),
        toCome: +recurringNotCollectedSum.toFixed(2),
        total: +(recurringCollectedSum + recurringNotCollectedSum).toFixed(2),
      },
      transactions: {
        refunds: {
          collected: countRefundsCollected,
          toCome: countRefundsNotCollected,
          total: countRefundsCollected + countRefundsNotCollected,
        },
        oneTime: {
          collected: countOneTimeCollected,
          toCome: countOneTimeNotCollected,
          total: countOneTimeCollected + countOneTimeNotCollected,
        },
        recurring: {
          collected: countRecurringCollected,
          toCome: countRecurringNotCollected,
          total: countRecurringCollected + countRecurringNotCollected,
        },
        total: countTotalTransctions,
      },
    })
  }
}
