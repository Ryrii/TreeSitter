import express from 'express';
import {getData2, processSourceCode, sourceCode} from './graph.js';
import { getSourceCode } from './treeParse.js';
import cors from 'cors';
import path from 'path';
import { log } from 'console';

const initialSourceCode = await getSourceCode();
const app = express();
app.use(cors());
const port = 3000;
app.use(express.static(path.join(process.cwd(), 'front')));
app.get('/', (req, res) => {
  res.sendFile({ root: path.join(process.cwd(), 'front') });
});
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/data', (req, res) => {
  const types = [
    "class_declaration",
    // "constructor_declaration",
    // "method_declaration",
    // "field_declaration",
    // "local_variable_declaration",
    "type_identifier",
    
  ];  
  res.json({data: getData2(initialSourceCode,types), sourceCode:initialSourceCode})//, sourceCode: sourceCode});
  log("ok");
});
app.use(express.json({ limit: '2mb' })); // Augmente la limite à 2mb
app.post('/data', (req, res) => {
  log("processing source code : \n");
  const sourceCode = req.body.sourceCode;
  const types = req.body.types;
  res.json({data: getData2(sourceCode,types)})
  log("ok");

});

app.listen(port, () => {
  console.log(`Serveur en écoute à http://localhost:${port}`);
});
