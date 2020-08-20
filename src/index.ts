import 'reflect-metadata';

import express from 'express';
import {
  createConnection,
  getRepository,
  Repository,
  createQueryBuilder,
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
    const { username, latitude, longitude } = req.body;

    if (!username || !latitude || !longitude)
      throw new Error('Please provide username, latitude and longitude')

    await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        username,
        location: `point(${longitude} ${latitude})`
      })
      .execute()

    res.json({ message: 'User created' })
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
})

app.get('/users', async (req, res) => {
  try {
    const { username, radius } = req.query as { username: string, radius: string };

    if (!username)
      throw new Error('Please, give us your username')

    const user = await userRepository.findOne({ username });

    if (!user)
      throw new Error('The user does not exist')

    const distances = await userRepository
      .query(
        'select username, ST_Distance(u.location, me.location) as distance ' + 
        `from users as u, lateral(select id, location from users where username='${username}') as me ` +
        `where u.id <> me.id ${
          radius ? 
          `and ST_Distance(u.location, me.location) < ${radius} order by distance` 
          : 
          'order by distance'
        };`
      )

      res.json(distances);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });  
  }
})

const port = 3333;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`)
})