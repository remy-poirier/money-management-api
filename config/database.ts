import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const isDev = env.get('NODE_ENV') === 'development'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        ...(!isDev && {
          ssl: {
            rejectUnauthorized: false,
          },
        }),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
