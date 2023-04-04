import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import checkSessionIdExists from '../middlewares/check-session-id-exists'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', async (req, res) => {
    console.log('preHandler all transactions routes.')
  })

  app.get(
    '/summary',
    {
      preHandler: checkSessionIdExists,
    },
    async (req, res) => {
      const { sessionId } = req.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'ammount' })
        .first()

      return res.send({ summary })
    },
  )

  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (req, res) => {
      const { sessionId } = req.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return res.send({ transactions })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (req, res) => {
      const transactionSchema = z.object({
        id: z.string().uuid(),
      })
      const { sessionId } = req.cookies

      const { id } = transactionSchema.parse(req.params)

      const transaction = await knex('transactions')
        .where('session_id', sessionId)
        .where('id', id)
        .first()

      return res.send({ transaction })
    },
  )

  app.post('/', async (req, res) => {
    const transactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = transactionSchema.parse(req.body)

    const sessionId = req.cookies.sessionId || randomUUID()

    res.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return res.status(201).send()
  })
}
