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
    const { username, latitude, longitude } = req.body;

    if (!username || !latitude || !longitude)
      throw new Error('Please provide username, latitude and longitude')

    await userRepository.query(
      'INSERT INTO users (username, location)' +
      'VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326));',
      [username, longitude, latitude]
    )

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

    const parameters = radius ? [username, radius] : [username];
    const sql = `
      SELECT username, ST_Distance(users.location, me.location) AS distance 
      FROM users, LATERAL(SELECT id, location FROM users WHERE username=$1) AS me 
      WHERE users.id <> me.id ${radius ? 'and ST_Distance(users.location, me.location) < $2' : ''} order by distance
    `
    const distances = await userRepository.query(sql, parameters);

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