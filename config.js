var mongoose = require('mongoose')

//if the server is production
const isProduction = process.env.NODE_ENV === 'production';

//mongo PORT
const mongo_port = "27111";

//connect to the DB
let ADMIN_MONGO_URL = "mongodb://localhost:" + mongo_port + "/ed_facade";
let db = mongoose.connect(ADMIN_MONGO_URL);

//export stuff
module.exports = {
    db: db,
    mongoose_port: mongo_port,
    isProduction: isProduction,
};