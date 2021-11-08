let express = require('express');
var session = require('express-session')
let cors = require('cors')
const MongoStore = require('connect-mongo');
const errorHandler = require('errorhandler');
const path = require('path')

//get the config
let config = require("./config.js");

//set up the basic server
let app = express();
app.use(cors());
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(session({
  secret: 'keyboard cat with a mat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false},
  maxAge: 3600000 * 12,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:' + config.mongoose_port + '/ed_facade-session-store',
  })
}));
if(!(config.isProduction)) {
    app.use(errorHandler());
}

//set up auth
require('./src/auth/setUpAuth.js').setUpAuth(app);

//routes
app.use(require('./src/authRoutes'));
app.use(require('./src/routes'));
app.use('/docs', express.static(path.join(__dirname, 'apidoc')));
/////////////////////////

//Error handlers & middlewares
if(!(config.isProduction)) {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
  
      res.json({
        errors: {
          message: err.message,
          error: err,
        },
      });
    });
  }
  
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
  
    res.json({
      errors: {
        message: err.message,
        error: {},
      },
    });
});

app.listen(7789, () => console.log('Server running on http://localhost:7789/'));
