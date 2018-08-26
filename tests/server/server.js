const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(bodyParser.urlencoded({
	extended: false
}));

require('./routes/index')(app);
require('./routes/text')(app);
require('./routes/html')(app);
require('./routes/status')(app);
require('./routes/forms')(app);
require('./routes/authentication')(app);
require('./routes/ajax')(app);
require('./routes/remoteControl')(app);

app.listen(3000, () => console.log('Test server now listening on port 3000!'));