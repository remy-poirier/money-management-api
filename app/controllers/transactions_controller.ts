import { HttpContext } from '@adonisjs/core/http'
import TransactionsService from '#services/transactions_service'
import { inject } from '@adonisjs/core'

@inject()
export default class TransactionsController {
  constructor(protected transactionsService: TransactionsService) {}

  async index(request: HttpContext) {
    return this.transactionsService.all(request)
  }

  async addTransaction(request: HttpContext) {
    return this.transactionsService.addTransaction(request)
  }

  async getWage(request: HttpContext) {
    const wage = await this.transactionsService.getLastWage(request)

    if (!wage) {
      return request.response.json(0)
    }
    return request.response.json(wage.amount)
  }

  async addWage(request: HttpContext) {
    return this.transactionsService.addWage(request)
  }

  async editWage(request: HttpContext) {
    return this.transactionsService.editWage(request)
  }

  async toggleCollected(request: HttpContext) {
    return this.transactionsService.toggleCollected(request)
  }

  async archive(request: HttpContext) {
    return this.transactionsService.archive(request)
  }

  async update(request: HttpContext) {
    return this.transactionsService.update(request)
  }

  async reset(request: HttpContext) {
    return this.transactionsService.reset(request)
  }
}
