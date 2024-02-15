/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Session routes
router.post('signup', '#controllers/session_controller.signup')
router.post('signin', '#controllers/session_controller.signin')

router
  .get('auth', async ({ auth }) => {
    const isAuthenticated = await auth.check()
    return isAuthenticated
      ? { state: 'authenticated', user: auth.user }
      : { state: 'unauthenticated' }
  })
  .use(middleware.auth())
router
  .post('signout', async ({ auth, response }) => {
    await auth.use('web').logout()
    return response.json(true)
  })
  .use(middleware.auth())

// Admin routes
router
  .group(() => {
    router.get('users', '#controllers/users_controller.index')
  })
  .prefix('admin')
  .use(middleware.admin())
