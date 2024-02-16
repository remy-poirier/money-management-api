import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /*
       Add 2 columns:

       1. is_onboarded: boolean
       2. onboarding_status: 'WELCOME', 'AMOUNT_ON_ACCOUNT', 'RECURRING', 'ONBOARDED'
       */

      table.boolean('is_onboarded').defaultTo(false)
      table
        .enum('onboarding_status', ['WELCOME', 'AMOUNT_ON_ACCOUNT', 'RECURRING', 'ONBOARDED'])
        .notNullable()
        .defaultTo('WELCOME')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_onboarded')
      table.dropColumn('onboarding_status')
    })
  }
}
