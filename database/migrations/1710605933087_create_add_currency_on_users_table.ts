import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('currency').defaultTo('EUR')
    })

    this.defer(async (db) => {
      const users = await db.from('users').whereNull('currency')
      console.log('ok users => ', users)
      await Promise.all(
        users.map((user) => {
          return user.update('currency', 'EUR')
        })
      )
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('currency')
    })
  }
}
