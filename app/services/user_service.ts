import db from '@adonisjs/lucid/services/db'
import { HttpContext } from '@adonisjs/core/http'
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
}
