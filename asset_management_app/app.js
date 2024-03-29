// const http = require('http');
// const hostname = '127.0.0.1';
// const port = 3000

const express = require('express');
const app = express();
const hbs = require('hbs');
const request = require('request');
const path = require('path');
const routes = require('./routes');
const session = require('express-session');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World')
// });

// var passenger_config = require('./Passengerfile.json');
// var server = ldap.createServer();

const {
    PORT = 80,
    SESS_LIFETIME = 1000 * 60 * 60 * 2,
    SESS_NAME = 'sid'
} = process.env;

app.set('trust proxy', 1);
app.set('port', process.env.PORT || 80);
app.set('view engine', 'hbs');

app.use(express.static('static'));

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({
    extended: true
})); // to support URL-encoded bodies

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: 'astronautearth',
    cookie: {
        maxAge: SESS_LIFETIME,
        keys: ['alwayshasbeen', 'melonpie']   // ==> these two keys encrypt the cookie 
    }
}));

routes.do_set(app);


var listener = app.listen(app.get('port'), function() {
    console.log( 'Express server started on port: ' + listener.address().port);
});
