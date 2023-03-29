import fastify from 'fastify'

const app = fastify()

app.get('/hello', () => {
  return 'Hello, Nane!'
})

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP SERVER RUNNING! :D')
})
