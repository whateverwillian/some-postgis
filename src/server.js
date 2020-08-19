require('reflect-metadata');

const app = require('express')();

const port = 3333;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Jungle' })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`)
})
