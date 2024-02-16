import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Category from '#models/category'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

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

  @belongsTo(() => Category, {
    foreignKey: 'category_id',
  })
  declare category: BelongsTo<typeof Category>

  @beforeCreate()
  static generateId(transaction: Transaction) {
    transaction.id = uuidv4()
  }
}
