const express = require('express');
const app = express();
const browserify = require('browserify-middleware');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser')

// ******** Set port and start the server ********
const port = 3304
app.set('port', port);
app.listen(app.get('port'), function() {
  console.log('Listening on port: ', port)
});
// ******* End  *******

app.use(bodyParser.json()); // allows you to retrieve data from the body of requests made to this server

// ****** Set Headers ********
app.use(cors({
    origin:['http://localhost:3304'],
    methods:['GET','POST'],
    credentials: true // enable set cookie
})); // sets up the headers to allow cross origin requests
// ******** End Headers ********

app.use(express.static(path.join(__dirname, './client')));

app.use(session({
  secret: 'keyboard cat',
  _expires: false,
  secure: false,
  httpOnly: true,
  resave: true,
  saveUninitialized: true,
  loggedIn: false,
  cookie: {
    secure: false
  }
}));

app.use(cookieParser())

// Mock database to store session ids as long as server is ruuning
// If server stops or restarts, these are wiped
const messages = [];
let currentSession = {};
// *** End mock datase ****

var validate = function(req, res, next) { // Session validation/creation middleware

  if (currentSession[req.session.id]) {
    next()
  } else {
    req.session.loggedIn = true
    currentSession[req.session.id] = req.body.name
    next()
  }
}

app.post('/postMessage', function(req, res) {

  messages.unshift(req.body.message)
  res.status(201).send({messages: messages})

})

app.get('/getMessages', function(req, res, next) {

  res.status(200).send(messages)

})

app.post('/logIn', validate, function(req, res) {

  res.status(200)
  res.send({messages: messages});

})

app.get('/home', function(req, res) {

  if (currentSession[req.session.id]) {

    res.status(200)
    res.send({
      messages: messages,
      isLoggedIn: true,
      name: currentSession[req.session.id]
    });

  } else {
    res.status(200).send({isLoggedIn: false})
  }

})

app.get('*', browserify('./client/index.js', {
  transform: [ [ require('babelify'), { presets: ['es2015', 'react'] } ] ]
}));