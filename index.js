const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
var { version, name } = require("./package.json");
require("dotenv").config();
require("./connections/redis");
if (process.env.NODE_ENV == "production") {
    console.log = () => { };
}

//Configure our app
app.use(
    cors({
        origin: "*",
        methods: "GET",
        exposedHeaders:
            "Content-Type, nocache"
    })
);

app.use(morgan('combined'), morgan("combined", { stream: require("fs").createWriteStream(path.join(__dirname, name + ".log"), { flags: "a" }) }));

app.use(helmet());
app.use((request, response, next) => {
    response.header('version', version, { sameSite: true })
    next();
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

app.use('/metar', require("./modules/info/routes"));
// START INIT ON PROGRAM LOAD
require('./modules/info/controllers/info').init(status => {
    if (status)
        app.listen(process.env.PORT, '0.0.0.0', () => console.log('Server started on port: ' + process.env.PORT));
    else
        console.log('INIT Failed')
})

