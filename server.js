const express = require('express');
const app = express();
const browserify = require('browserify-middleware');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieSession = require('cookie-session')
var cookieParser = require('cookie-parser')

var port = 3304
app.set('port', port);
app.listen(app.get('port'), function() {
  console.log('Listening on port: ', port)
});

const messages = [];
let currentSession = {};

app.use(bodyParser.json()); // allows you to retrieve data from the body of requests made to this server
app.use(cors({
    origin:['http://localhost:3304'],
    methods:['GET','POST'],
    credentials: true // enable set cookie
})); // sets up the headers to allow cross origin requests

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

var validate = function(req, res, next) {
  console.log('In validate');
  if (currentSession[req.session.id]) {
    // console.log('IS LOGGED ON ALREADY', req.session.loggedIn, req.session.id)
    next()
  } else {
    req.session.loggedIn = true
    console.log('LOGIN NAME STUFF', req.body.name)
    currentSession[req.session.id] = req.body.name
    // console.log('SESSSION ADDED TO OBJECT', currentSession[req.session.id])
    next()
  }
}
app.use(cookieParser())

app.post('/postMessage', function(req, res) {

  // console.log('IN THE SERVER -----------------------', req.session.id )
  messages.unshift(req.body.message)
  res.status(201)
  res.send(messages)
})

app.get('/getMessages', function(req, res, next) {
  // console.log('first func', req.session.loggedIn)

  res.status(200).send(messages)
})

app.post('/logIn', validate, function(req, res) {



  res.status(200)
  res.send({messages: messages});
})

app.get('/home', function(req, res) {
  // console.log('AT HOME', req.session.id)
  if (currentSession[req.session.id]) {
    res.status(200)
    res.send({messages: messages, isLoggedIn: true, name: currentSession[req.session.id]})
  } else {
    res.status(200)
    res.send({isLoggedIn: false})
  }
})

app.get('*', browserify('./client/index.js', {
  transform: [ [ require('babelify'), { presets: ['es2015', 'react'] } ] ]
}));