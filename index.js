const express = require("express");
const app = require('express')();
const bodyParser = require("body-parser");
const dbConfig = require("./database/db");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

mongoose.set("useCreateIndex", true);
mongoose.connect(dbConfig.online_db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});


const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100'
  ];
  
  // Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    }
  }
  
  // Enable preflight requests for all routes
  app.options('*', cors(corsOptions));

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.use("/api",  cors(corsOptions), require("./router/mainRouter"));

let port = process.env.PORT || 3000;
if (port == null || port == "") {
    port = 3000;
}

const server = app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});

let io = require('socket.io')(server, {

    cors: {
        origin: ["http://localhost:4200", "https://admin-frontend-lyart.vercel.app"],
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {

    socket.on('notify', (data) => {
        socket.user = data.user;
        io.emit('send-notification', data);
    });

});