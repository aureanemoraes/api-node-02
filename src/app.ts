import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (req, res) => {
  console.log('preHandler all routes.')
})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})

export default app
