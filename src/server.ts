/* eslint-disable no-console */

import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import newrelic from 'newrelic/index';
import router from './routes';

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(router);
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
