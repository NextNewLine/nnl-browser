const express = require('express')
const app = express()

app.get('/', (reqest, response) => res.send('Hello World!'))

app.listen(3000, () => console.log('Test server now listening on port 3000!'))