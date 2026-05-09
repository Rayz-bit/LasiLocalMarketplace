const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

// 1. Get the cloud link and swap in your real password
const DB = process.env.DATABASE.replace(
    "<db_password>",
    process.env.DATABASE_PASSWORD
);

// 2. Connect to the Cloud Database
mongoose.connect(DB).then(() => {
    console.log("DB connected succesfully!");
}).catch(err => {
    console.log("DB connection failed!", err.message);
});

// 3. Start the Server
const port = 3000;
app.listen(port, () => {
    console.log(`RESTful API Server running on port ${port}...`);
});