const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Image = require('./models/image')

/* ----------------------- configuration of dir, templates, EJS, encoding & route overriding ------------------------- */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended:true }))
app.use(methodOverride('_method'))


/* ---------------------------------------------------- MongoDB connection ---------------------------------------------------- */
let db_name = 'ig_db'
mongoose.connect('mongodb://localhost:27017/' + db_name, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false     /* remove findAndModify deprecation warning */
}).then()

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */
/* landing page */
app.get('/', (req, res) => {
    res.render('homepage')
})
/* index */
app.get('/images', async (req, res) => {
    const images = await Image.find({});
    res.render('images/index', { images })
})
/* create */
app.get('/images/new', (req, res) => {
    res.render('images/new');
})
app.post('/images', async (req, res) => {
    const image = new Image(req.body.image);
    await image.save();
    res.redirect(`/images/${image._id}`)
})
/* show */
app.get('/images/:id', async (req, res) => {
    const image = await Image.findById(req.params.id)
    res.render('images/show', {image})
})
/* update */
app.get('/images/:id/edit', async (req, res) => {
    const image = await Image.findById(req.params.id)
    res.render('images/edit', { image });
})
app.put('/images/:id', async (req, res) => {
    const { id } = req.params;
    const image = await Image.findByIdAndUpdate(id, { ...req.body.image });
    res.redirect(`/images/${image._id}`)
});
/* to do */
app.delete('/images/:id', async (req, res) => {
    const { id } = req.params;
    await Image.findByIdAndDelete(id);
    res.redirect('/images');
})

/* ============================================= connection to the port/localhost ============================================= */
const port = 3000 || process.env.PORT
app.listen(port, () => {
    console.log('Connected to port', port)
})