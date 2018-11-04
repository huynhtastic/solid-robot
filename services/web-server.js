const http = require('http');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const webServerConfig = require('../config/web-server.js');
const router = require('./router.js');
const database = require('./database.js');

let httpServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    httpServer = http.createServer(app);

    // Combines logging info from request and response
    app.use(morgan('combined'));

		// Parse incoming JSON requests and revive JSON
		app.use(express.json({
			reviver: reviveJson
		}));

    app.use(cors());

    app.use('/api', router);

    /* [BEGIN] user-session tracking */
    // access cookies stored in browser
    app.use(cookieParser());

    // track logged-in user across sessions
    app.use(session({
      key: 'emp_id',
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 6000
      }
    }));

    // check if user's cookie is saved in browser w/o user set: log them out
    // happens when you stop express after login and cookie is still saved
    app.use((req, res, next) => {
      if (req.cookies.emp_id && !req.session.user) {
        res.clearCookie('emp_id');
      }
      next();
    });

    var sessionChecker = (req, res, next) => {
      if (req.session.user && req.cookies.emp_id) {
        res.redirect('/dashboard');
      } else {
        next();
      }
    };

    /* [END] user-session tracking */

    httpServer.listen(webServerConfig.port)
      .on('listening', () => {
        console.log(`Web server listening on localhost:${webServerConfig.port}`);

        resolve();
      })
      .on('error', err => {
        reject(err);
      });
  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports.close = close;

const iso8601RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
 
function reviveJson(key, value) {
  // revive ISO 8601 date strings to instances of Date
  if (typeof value === 'string' && iso8601RegExp.test(value)) {
    return new Date(value);
  } else {
    return value;
  }
}
