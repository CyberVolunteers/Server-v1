const express = require('express');
const app = express();
const port = 1234;

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/helloworld', (req, res) => res.send('Hello World! HEYY'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));