import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.string('name').notNullable()
      table.float('amount').notNullable()
      table.integer('day').notNullable()
      table.boolean('collected').notNullable().defaultTo(false)
      table
        .enum('type', ['RECURRING', 'ONE_TIME', 'REFUND', 'WAGE'])
        .notNullable()
        .defaultTo('ONE_TIME')

      table.boolean('archived').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // relations
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('category_id').references('id').inTable('categories').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
