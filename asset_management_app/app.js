// const http = require('http');
// const hostname = '127.0.0.1';
// const port = 3000

var express = require('express');
var app = express();
var hbs = require('hbs');
var request = require('request');
var path = require('path');
var routes = require('./routes');

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World')
// });

app.set('trust proxy', 1);
app.set('port', process.env.PORT || 8000);
app.set('view engine', 'hbs');

app.use(express.static('static'));

routes.do_set(app);

var listener = app.listen(app.get('port'), function() {
    console.log( 'Express server started on port: ' + listener.address().port);
});