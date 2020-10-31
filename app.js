const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('./'));



app.set('port', 8081);

app.listen(app.get('port'), () => {
    console.log('Server started: http://localhost:' + app.get('port'));
});




