import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { credentialsValidator } from '#validators/session'

export default class SessionController {
  async signin({ request, response }: HttpContext) {
    // Get credentials
    const { email, password } = request.only(['email', 'password'])

    // Verify credentials
    const user = await User.verifyCredentials(email, password)

    // Define token
    const token = await User.accessTokens.create(user)
    return response.json({ token, user })
  }

  async signup({ request, response }: HttpContext) {
    const data = request.all()
    const payload = await credentialsValidator.validate(data)

    // Create user
    const createdUser = await User.create(payload)

    // Verify credentials
    const user = await User.verifyCredentials(createdUser.email, payload.password)

    // Define token
    const token = await User.accessTokens.create(user)

    return response.json({ token, user })
  }
}
