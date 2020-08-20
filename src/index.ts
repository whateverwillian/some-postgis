import 'reflect-metadata';

import express from 'express';
import {
  createConnection,
  getRepository,
  Repository,
} from 'typeorm';

import User from './entities/User';

let userRepository: Repository<User>;

createConnection()
  .then(() => {
    userRepository = getRepository(User)
  })
  .catch((err) => console.error(err))

  const app = express();

app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const users = await userRepository.find();

    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

app.post('/users', async (req, res) => {
  try {
    const { username, location } = req.body;
  
    const user = userRepository.create({
      username,
      location,
    })
    
    await userRepository.save(user);

    res.json({ user })
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
})

const port = 3333;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`)
})
