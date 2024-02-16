// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import StatisticsService from '#services/statistic_service'
import { inject } from '@adonisjs/core'

@inject()
export default class StatisticsController {
  constructor(protected statisticsService: StatisticsService) {}

  async index(request: HttpContext) {
    return this.statisticsService.all(request)
  }
}
