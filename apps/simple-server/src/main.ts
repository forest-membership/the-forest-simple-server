/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { JsonDB, Config } from 'node-json-db';

const db = new JsonDB(new Config("./apps/simple-server/db/myDataBase", true, true, '/'));
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// refresh user
app.get('/api/users/refresh', async (req, res) => {
  await db.push("/users[0]", {
    userInfo: {
      userId: '0',
      nickname: 'a',
    }
  }, true);

  res.status(200).send({ message: 'refresh userId: 0 !!!!' });
});

// create
app.post('/api/user', async (req, res) => {
  try {
    const { userId, nickname } = req.body;
    const lastIndex = (await db.getData(`/users`)).length;
    await db.push(`/users/${lastIndex}`, {
      userInfo: {
        userId,
        nickname,
      }
    })
    res.status(201).send({ message: "success created User!!!"});
  } catch {
    res.status(400).send({ message: 'server err existed !!!' });
  }
})

// read all Users
app.get('/api/Users', async (req, res) => {
  try {
    const data = await db.getData(`/`);
    res.status(200).json({ data });
  } catch {
    res.status(400).send({ message: 'server err existed !!!' });
  }
})

// read one Users
app.get('/api/Users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = (await db.getData(`/users`)).find((item) => item.userInfo.userId === id);
    if (user) {
      res.status(200).json({ data: user });
    }
    else {
      res.status(400).send({ message: 'not existed user' });
    }
  } catch {
    res.status(400).send({ message: 'server err existed !!!' });
  }
});

// update user
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, userId } = req.body;

    const isExisted = (await db.getData(`/users`)).some((item) => item.userInfo.userId === id);

    if (isExisted) {
      await db.push(`/users[${id}]`, {
        userInfo: {
          nickname,
          userId,
        }
      });
      res.status(200).end();
    } else {
      res.status(400).send({ message: 'not existed User !!!' });
    }
  } catch {
    res.status(400).send({ message: 'server err existed !!!' });
  }
});

// delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = (await db.getData(`/users`)).findIndex((item) => item.userInfo.userId === id);

    if (userIndex !== -1) {
      await db.delete(`/users[${userIndex}]`);
      res.status(200).end();
    } else {
      res.status(400).send({ message: 'not existed User !!!' });
    }
  } catch {
    res.status(400).send({ message: 'server err existed !!!' });
  }
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
