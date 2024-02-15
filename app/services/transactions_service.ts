import { HttpContext } from '@adonisjs/core/http'
import {
  createTransactionValidator,
  toggleCollectedTransactionValidator,
  wageValidator,
} from '#validators/transaction'
import Transaction from '#models/transaction'
import Category from '#models/category'
import User from '#models/user'

export default class TransactionsService {
  async all({ request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '*')

    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }
    const limit = 2

    return await Transaction.query()
      .where('user_id', userId)
      .where('type', type)
      .where('archived', false)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }

  async getLastWage({ auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }

    return await Transaction.query()
      .where('user_id', userId)
      .where('type', 'WAGE')
      .orderBy('created_at', 'desc')
      .first()
  }

  async addWage({ request, auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }
    const data = request.all()

    const amount = await wageValidator.validate(data)

    // Gather required data
    const currentWage = await Transaction.query()
      .where('user_id', userId)
      .where('type', 'WAGE')
      .first()
    const user = await User.findBy('id', userId)
    const apiCategory = await Category.findBy('name', 'Api')

    if (!apiCategory) {
      throw new Error('Category Api not found')
    }

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    // If previous wage, delete it
    if (currentWage) {
      await currentWage.delete()
    }

    const newWage = await Transaction.create({
      name: 'Wage',
      amount: amount.amount,
      day: new Date().getDate(),
      collected: true,
      type: 'WAGE',
      archived: false,
      user_id: userId,
      category_id: apiCategory.id,
    })

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    user.balance += newWage.amount
    await user.save()

    // update balance of user

    return user.balance
  }

  async editWage({ request, auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }
    const data = request.all()

    const amount = await wageValidator.validate(data)

    const currentWage = await Transaction.query()
      .where('user_id', userId)
      .where('type', 'WAGE')
      .first()
    const user = await User.findBy('id', userId)
    const apiCategory = await Category.findBy('name', 'Api')

    if (!currentWage) {
      throw new Error('Wage not found')
    }

    if (!apiCategory) {
      throw new Error('Category Api not found')
    }

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    // remove old balance before adding new one
    user.balance -= currentWage.amount

    await currentWage.delete()

    const newWage = await Transaction.create({
      name: 'Wage',
      amount: amount.amount,
      day: new Date().getDate(),
      collected: true,
      type: 'WAGE',
      archived: false,
      user_id: userId,
      category_id: apiCategory.id,
    })

    user.balance += newWage.amount
    await user.save()

    return user.balance
  }

  async addTransaction({ request, auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }
    const data = request.all()

    const transaction = await createTransactionValidator.validate(data)

    const user = await User.findBy('id', userId)

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    const newTransaction = await Transaction.create({
      name: transaction.name,
      amount: transaction.amount,
      day: transaction.day,
      collected: transaction.collected,
      type: transaction.type,
      archived: transaction.archived,
      user_id: userId,
      category_id: transaction.category_id,
    })

    if (newTransaction.collected && newTransaction.type !== 'REFUND') {
      user.balance -= newTransaction.amount
    }

    if (newTransaction.collected && newTransaction.type === 'REFUND') {
      user.balance += newTransaction.amount
    }
    await user.save()

    return user.balance
  }

  async toggleCollected({ auth, request }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }

    const data = request.all()
    const { id } = await toggleCollectedTransactionValidator.validate(data)
    const user = await User.findBy('id', userId)

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    const transaction = await Transaction.findBy('id', id)
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`)
    }

    await transaction.merge({ collected: !transaction.collected }).save()

    /**
     * Many use cases here about updating the balance of the user
     * depending on the type of transaction and if it's collected or not
     */

    if (transaction.type === 'REFUND') {
      if (transaction.collected) {
        user.balance += transaction.amount
      } else {
        user.balance -= transaction.amount
      }
    }

    if (transaction.type !== 'REFUND') {
      if (transaction.collected) {
        user.balance -= transaction.amount
      } else {
        user.balance += transaction.amount
      }
    }

    await user.save()
    return transaction
  }

  async archive({ auth, request }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }

    const data = request.all()
    const { id } = await toggleCollectedTransactionValidator.validate(data)
    const user = await User.findBy('id', userId)

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    const transaction = await Transaction.findBy('id', id)
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`)
    }

    await transaction.merge({ archived: !transaction.archived }).save()

    return transaction
  }
}
