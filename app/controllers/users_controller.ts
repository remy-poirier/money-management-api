import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'

@inject()
export default class UsersController {
  constructor(protected userService: UserService) {}

  async index(request: HttpContext) {
    return this.userService.all(request)
  }
}
