import { HttpContext } from '@adonisjs/core/http'
import {
  addViaShortcutValidator,
  createTransactionValidator,
  toggleCollectedTransactionValidator,
  updateTransactionValidator,
  wageValidator,
} from '#validators/transaction'
import Transaction from '#models/transaction'
import Category from '#models/category'
import User from '#models/user'

export default class TransactionsService {
  async checkCanAlterTransaction(user: User, transactionId: string) {
    /**
     * A user can alter a transaction in 2 cases:
     * 1. It's his own transaction (user_id = auth.user.id)
     * 2. Current user is an admin (auth.user.isAdmin = true)
     * Otherwise we throw an error
     */

    const userId = user.id

    const transaction = await Transaction.findBy('id', transactionId)
    if (!transaction) {
      throw new Error(`Transaction with id ${transactionId} not found`)
    }

    if (transaction.user_id !== userId && !user.is_admin) {
      throw new Error('You are not allowed to alter this transaction')
    }
  }

  async all({ request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '*')
    const collected = request.input('collected', '*')
    const search = request.input('search', undefined)
    const orderByDirection = request.input('orderByDirection', 'desc')

    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }
    const limit = 10

    const q = Transaction.query()
      .preload('category')
      .where('user_id', userId)
      .where('type', type)
      .where('archived', false)

    if (collected === 'true') {
      q.where('collected', true)
    }
    if (collected === 'false') {
      q.where('collected', false)
    }

    if (search) {
      q.whereILike('name', `%${search}%`)
    }

    return await q
      .orderBy('day', orderByDirection)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }

  async nextToCollect({ auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }
    const limit = 10

    // get 10 next transactions to collect, these are transaction of type either RECURRING or ONE_TIME and with day closest to today
    return Transaction.query()
      .preload('category')
      .where('user_id', userId)
      .where('collected', false)
      .where('archived', false)
      .whereIn('type', ['RECURRING', 'ONE_TIME'])
      .orderBy('day', 'asc')
      .limit(limit)
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

    await this.checkCanAlterTransaction(user, currentWage.id)

    // remove old balance before adding new one
    user.balance = +(user.balance - currentWage.amount).toFixed(2)

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

    user.balance = +(user.balance + newWage.amount).toFixed(2)
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
      user.balance = +(user.balance - newTransaction.amount).toFixed(2)
    }

    if (newTransaction.collected && newTransaction.type === 'REFUND') {
      user.balance = +(user.balance + newTransaction.amount).toFixed(2)
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

    await this.checkCanAlterTransaction(auth.user, id)

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
        user.balance = +(user.balance + transaction.amount).toFixed(2)
      } else {
        user.balance = +(user.balance - transaction.amount).toFixed(2)
      }
    }

    if (transaction.type !== 'REFUND') {
      if (transaction.collected) {
        user.balance = +(user.balance - transaction.amount).toFixed(2)
      } else {
        user.balance = +(user.balance + transaction.amount).toFixed(2)
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

    await this.checkCanAlterTransaction(auth.user, id)

    const user = await User.findBy('id', userId)

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    const transaction = await Transaction.findBy('id', id)
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`)
    }

    await transaction.merge({ archived: !transaction.archived }).save()

    // If transaction was colllected, we need to update the balance of the user
    if (transaction.collected) {
      if (transaction.type === 'REFUND') {
        user.balance = +(user.balance - transaction.amount).toFixed(2)
      } else {
        user.balance = +(user.balance + transaction.amount)
      }
    }

    await user.save()

    return transaction
  }

  async update({ request, auth }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }

    const data = request.all()
    const transactionValidation = await updateTransactionValidator.validate(data)

    // Check if user can alter the transaction
    await this.checkCanAlterTransaction(auth.user, transactionValidation.id)

    const transaction = await Transaction.findBy('id', transactionValidation.id)

    if (!transaction) {
      throw new Error(`Transaction with id ${transactionValidation.id} not found`)
    }

    const updatedTransaction = await transaction.merge(transactionValidation).save()

    /**
     * We will prevent the user from updating the transaction if it's already collected or archived.
     * So in theory, we don't need to update the balance of the user here.
     */

    return updatedTransaction
  }

  async reset({ auth, response }: HttpContext) {
    const userId = auth.user?.id
    if (!userId) {
      throw new Error(`User with id ${userId} not found`)
    }

    /**
     * Many things to do here:
     *
     * 1. Update status of all user's RECURRING transactions with collected = true to collected = false
     * 2. Delete all user's ONE_TIME transactions with collected = true
     * 3. Delete status of all user's REFUND transactions with collected = true to collected = false
     */

    await Transaction.query()
      .where('user_id', userId)
      .where('type', 'RECURRING')
      .where('collected', true)
      .update({ collected: false })

    await Transaction.query()
      .where('user_id', userId)
      .where('type', 'ONE_TIME')
      .where('collected', true)
      .delete()

    await Transaction.query()
      .where('user_id', userId)
      .where('type', 'REFUND')
      .where('collected', true)
      .delete()

    return response.json(true)
  }

  async addViaShortcut({ request }: HttpContext) {
    const today = new Date().getDate()
    const data = request.all()
    const dataValidation = await addViaShortcutValidator.validate(data)

    const user = await User.findBy('id', dataValidation.user_id)
    if (!user) {
      throw new Error(`User with id ${dataValidation.user_id} not found`)
    }

    // ensure the user has the correct shortcut secret
    if (user.shortcut_secret !== dataValidation.shortcut_secret) {
      throw new Error('Invalid shortcut secret')
    }

    const newTransaction = await Transaction.create({
      name: dataValidation.name,
      amount: dataValidation.amount,
      day: today,
      collected: false,
      type: 'ONE_TIME',
      archived: false,
      user_id: user.id,
      category_id: dataValidation.category_id || '8fbd6c98-cc0f-11ee-9489-325096b39f47',
    })

    return newTransaction
  }
}
