import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare amount: number

  @column()
  declare day: number

  @column()
  declare collected: boolean

  @column()
  declare type: 'RECURRING' | 'ONE_TIME' | 'REFUND' | 'WAGE'

  @column()
  declare archived: boolean

  @column()
  declare user_id: string

  @column()
  declare category_id: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @beforeCreate()
  static generateId(transaction: Transaction) {
    transaction.id = uuidv4()
  }
}
