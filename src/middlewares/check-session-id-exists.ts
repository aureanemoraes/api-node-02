import { FastifyReply, FastifyRequest } from 'fastify'

const checkSessionIdExists = async (req: FastifyRequest, res: FastifyReply) => {
  const { sessionId } = req.cookies

  if (!sessionId)
    return res.send({
      error: 'Unauthorized.',
    })
}

export default checkSessionIdExists
