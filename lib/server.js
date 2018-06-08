const express = require('express');
const app = express();

app.set('view engine', 'ejs');

require('./text')(app);
require('./html')(app);

app.listen(3000, () => console.log('Test server now listening on port 3000!'));