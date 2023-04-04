import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/summary', async (req, res) => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'ammount' })
      .first()

    return res.send({ summary })
  })

  app.get('/', async (req, res) => {
    const transactions = await knex('transactions').select()

    return res.send({ transactions })
  })

  app.get('/:id', async (req, res) => {
    const transactionSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = transactionSchema.parse(req.params)

    const transaction = await knex('transactions').where('id', id).first()

    return res.send({ transaction })
  })

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
