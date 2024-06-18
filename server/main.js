import express from 'express';
import {cyData,processSourceCode,sourceCode} from './graph.js';
import cors from 'cors';
import path from 'path';
import { log } from 'console';
const app = express();
app.use(cors());
const port = 3030;
app.use(express.static(path.join(process.cwd(), '../front')));app.get('/', (req, res) => {
  res.sendFile({ root: path.join(process.cwd(), 'front') });
});

app.get('/data', (req, res) => {

  res.json({data: cyData, sourceCode: sourceCode});
});
app.use(express.json());
app.post('/process', (req, res) => {
  log("processing source code : \n");
  const sourceCode = req.body.sourceCode;
  const tree = processSourceCode(sourceCode);
  res.json(tree);
});

app.listen(port, () => {
  console.log(`Serveur en écoute à http://localhost:${port}`);
});