import express from 'express';
import path from 'path';
import routes from './routes';
import cors from 'cors';


const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/tmp', express.static(path.resolve(__dirname, '..', 'tmp')));


app.listen(3333, () => console.log('Server up and running! Port:3333')); 