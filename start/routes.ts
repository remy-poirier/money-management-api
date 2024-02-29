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
import User from '#models/user'

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
    const user = await auth.use('api').authenticate()
    if (user) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }
    return response.json(true)
  })
  .use(middleware.auth())

router.get('categories', '#controllers/categories_controller.index')

// Transactions
router
  .group(() => {
    router.get('', '#controllers/transactions_controller.index')
    router.put('', '#controllers/transactions_controller.addTransaction')
    router.post('', '#controllers/transactions_controller.update')
    router.get('wage', '#controllers/transactions_controller.getWage')
    router.put('wage', '#controllers/transactions_controller.addWage')
    router.post('wage', '#controllers/transactions_controller.editWage')
    router.post('toggle-collected', '#controllers/transactions_controller.toggleCollected')
    router.post('archive', '#controllers/transactions_controller.archive')
    router.post('reset', '#controllers/transactions_controller.reset')
  })
  .prefix('transactions')
  .use(middleware.auth())

// User onboarding
router
  .group(() => {
    router.post('update', '#controllers/users_controller.updateOnboardingStatus')
    router.post('balance', '#controllers/users_controller.updateBalance')
    router.post('transactions', '#controllers/users_controller.updateRecurringTransactions')
  })
  .prefix('onboarding')
  .use(middleware.auth())

// Statistics
router.get('statistics', '#controllers/statistics_controller.index').use(middleware.auth())

// Admin routes
router
  .group(() => {
    router.get('users', '#controllers/users_controller.index')
  })
  .prefix('admin')
  .use(middleware.admin())
