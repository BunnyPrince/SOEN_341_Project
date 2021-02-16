const mongoose = require('mongoose')
const Image = require('../models/image') /* exporting image schema */
const Comment = require('../models/comment')
const imageSeeds = require('./imageSeeds') /* images to fill db */

/* ------------------------------------------------ MongoDB connection ------------------------------------------------ */
let db_name = 'ig_db'

mongoose.connect('mongodb://localhost:27017/' + db_name, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected. Seeding will start ...");
});

/* --------------------------------- Seeding db and closing --------------------------------- */
const seedDB = async () => {
    await Comment.deleteMany({})
    await Image.deleteMany({})
    for (const img of imageSeeds) {
        const newImg = new Image(img)
        await newImg.save()
    }

}

seedDB().then(() => {
    mongoose.connection.close()
        .then(() => { console.log("Seeding done.") });
})

/* Do not use this seeding file anymore */
