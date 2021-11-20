const express = require("express");
const app = require('express')();
const bodyParser = require("body-parser");
const dbConfig = require("./database/db");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const multer = require('multer')

mongoose.set("useCreateIndex", true);
mongoose.connect(dbConfig.online_db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

var db = mongoose.connection;
db.on("connected", () => {
    console.log("connected to database" + dbConfig.online_db);
});
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(morgan("common"));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

var publicDir = require('path').join(__dirname, '/uploads');
app.use(express.static(publicDir));

app.use(cors());
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
        // no larger than 5mb.
        fileSize: 5 * 1024 * 1024,
    },
})

app.use(multerMid.single('image'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/api", require("./router/mainRouter"));

let port = process.env.PORT || 3000;
if (port == null || port == "") {
    port = 3000;
}

const server = app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});

let io = require('socket.io')(server, {

    cors: {
        origin: ["http://localhost:4200", 'http://localhost', 'http://localhost:3000', 'http://localhost:63597', 'capacitor://localhost', 'ionic://localhost', "https://3xplore-hub-admin.vercel.app", "https://explorehub-admin-lizvy3b64-rivasjonathan-23.vercel.app/", "https://admin-frontend-lyart.vercel.app"],
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {

    socket.on('notify', (data) => {
        socket.user = data.user;
        io.emit('send-notification', data);
    });

});