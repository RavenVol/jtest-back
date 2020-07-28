'use strict';

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const passport = require('passport');
const authRouter = require('./routers/auth-routes');
const testRouter = require('./routers/test-routes');
const picRouter = require('./routers/pic-routes');
const searchRouter = require('./routers/search-routes');
const passportSetup = require('./config/passport-cfg');
const cookieSession = require('cookie-session');
const configServer = require('./config/configServer');
const keys = require('./config/keys');
const cors = require('cors');
const autorun = require('./config/autorun');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = configServer.port;
app.set('io', io);

// MiddleWares section
app.use(cors({
  origin: '*',
  methods: "GET, POST"
}));

app.use(cookieSession({
  maxAge: 1 * 60 * 60 * 1000,
  keys: [keys.cookies.key],
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes section
app.use('/api/auth', authRouter);
app.use('/api/test', testRouter);
app.use('/api/pic', picRouter);
app.use('/api/search', searchRouter);


// Starting server
server.listen(port, () => {
  console.log(`Server listening port ${port}`);
  autorun();
});
