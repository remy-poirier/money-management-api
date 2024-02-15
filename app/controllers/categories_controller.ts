// import type { HttpContext } from '@adonisjs/core/http'

import CategoryService from '#services/category_service'
import { inject } from '@adonisjs/core'

@inject()
export default class CategoriesController {
  constructor(protected categoryService: CategoryService) {}

  async index() {
    return this.categoryService.all()
  }
}
