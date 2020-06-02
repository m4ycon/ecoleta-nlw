import express from 'express';

const app = express();

app.use(express.json());

app.get('/users', (req, res) => {
  console.log('Listagem de usuários');
  res.json([
    'Diego',
    'Maycon'
  ])
});



app.listen(3333, () => console.log('Server up and running! Port:3333'));