const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

require('./routes/text')(app);
require('./routes/html')(app);

app.listen(3000, () => console.log('Test server now listening on port 3000!'));