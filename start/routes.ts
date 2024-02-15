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

router.get('auth', async ({ auth }) => {
  const isAuthenticated = await auth.check()
  return isAuthenticated
    ? { state: 'authenticated', user: auth.user }
    : { state: 'unauthenticated' }
})
router
  .post('signout', async ({ auth, response }) => {
    await auth.use('web').logout()
    return response.json(true)
  })
  .use(middleware.auth())

router.get('categories', '#controllers/categories_controller.index')

// Transactions
router
  .group(() => {
    router.get('', '#controllers/transactions_controller.index')
    router.put('', '#controllers/transactions_controller.addTransaction')
    router.get('wage', '#controllers/transactions_controller.getWage')
    router.put('wage', '#controllers/transactions_controller.addWage')
    router.post('wage', '#controllers/transactions_controller.editWage')
    router.post('toggle-collected', '#controllers/transactions_controller.toggleCollected')
    router.post('archive', '#controllers/transactions_controller.archive')
  })
  .prefix('transactions')
  .use(middleware.auth())

// Admin routes
router
  .group(() => {
    router.get('users', '#controllers/users_controller.index')
  })
  .prefix('admin')
  .use(middleware.admin())
