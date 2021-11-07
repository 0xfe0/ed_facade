let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy;

//import the model
const { User } = require('../models/User.js')

module.exports.setUpAuth = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser( async function(user, done) {
    try {

    }
  });
  
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async function(username, password, done) {
      let total;
      let n;
      let myRes = {};
      try{
          
          //banner///////////////
          let data = await axios.get(apiPrefix + '/resources/Residents/actions/list?direction=asc&sortBy=firstName&perPage=' + perPageConst,// '&page=' + pageNum,
          thirdArg);
          data = data.data;
          total = data.meta.total;
          perPage = data.meta.perPage;
          n = Math.ceil(total/perPage);
          let residentArray = [];
          for(let i = 1; i <= n; i++) {
              let residentObj = {};
              data = await axios.get(apiPrefix + '/resources/Residents/actions/list?direction=asc&sortBy=firstName&perPage=' + perPageConst + '&page=' + i,
              thirdArg);
              data = data.data;
              for(let j = 0; j < data.records.length; j++) {
                  residentObj = {};

                  residentObj.email = data.records[j].params.email;
                  residentObj.password = data.records[j].params.password;
                  residentObj.firstName = data.records[j].params.firstName;
                  residentObj.lastName = data.records[j].params.lastName;
                  residentObj.passwordChangedFlag = data.records[j].params.passwordChangedFlag;
                  residentObj.passwordChangedToken = data.records[j].params.passwordChangedToken;
                  residentObj.address = data.records[j].params.address;
                  residentObj.towerUnit = data.records[j].params.towerUnit;
                  residentObj.area = data.records[j].params.area;
                  residentObj.typeOfFlat = data.records[j].params.typeOfFlat;
                  residentObj.mobileNumber = data.records[j].params.mobileNumber;
                  residentObj.parkingFloors = data.records[j].params.parkingFloors;
                  residentObj.numberOfParking = data.records[j].params.numberOfParking;
                  residentObj.dateOfPossession = data.records[j].params.dateOfPossession;
                  residentObj.createdOn = data.records[j].params.createdOn;
                  residentObj._id = data.records[j].params._id;
                  residentObj.v = data.records[j].params.__v;
                  residentArray.push(residentObj);
              }
          }

          myRes.residents = residentArray;
          let towerUnitFound = false ;
          let passwordMatches = false;
          let userDat = {};
          myRes.residents.map((val, index) => {
            if(val.towerUnit.toLowerCase().trim() == username.toLowerCase().trim()) {
              towerUnitFound = true;
              if(val.password == password) {
                passwordMatches = true;
                val.password = "";
                userDat = val; 
              }
            }
          });

          if (!towerUnitFound) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!passwordMatches) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, userDat);
          /////////////////////////////////////////////////
          //////////////////////////////////////////////////
      } catch (error) {
        return done(error, false, { message: 'Something went wrong' });
      }
    }
  ));

  app.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }

      if (!user) { return res.status(200).json({error: "Invalid Username or Password!"}); }

      req.logIn(user, function(err) {

        if (err) { return next(err); }

        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
          req.session.cookie.expires = false; // Cookie expires at end of session
        }

        return res.status(200).json({user: user});

      });

    })(req, res, next);
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.status(200).json({logout: "success"});
  });

}