const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const myConnection = require('express-myconnection');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config');
const https = require('https');
const ejs = require('ejs');
let xmlparser = require('express-xml-bodyparser');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
dotenv.config({ path: './.env' });

const app = express();

app.use(myConnection(mysql, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    port: process.env.DB_PORT,
}, 'pool'));

morgan.token('id', function getid(req) {
    return req.id
})

//app.use(bodyParser.json());
app.disable('x-powered-by');
let logstream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "defaultSrc": ["'self'"],
            "scriptSrc": ["'self'", "https://maxcdn.bootstrapcdn.com/", "https://cdnjs.cloudflare.com/", "https://ajax.googleapis.com/"],
            "styleSrc": ["'self'", "https://maxcdn.bootstrapcdn.com/", "'nonce-randomcode'"],
            "imgSrc": ["'self'", "https://www.gravatar.com"]
        }
    }
}));

app.use(xmlparser({ strict: true }));

app.use(assignid);

const publicdir = path.join(__dirname, './public');                        //__dirname gives the path of the current directory of your project
app.use(express.static(publicdir));
app.use(morgan(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: logstream }));
app.use(morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400 }
}))
//To parse url encoded bodies
app.use(express.urlencoded({ extended: false }));


app.use(express.json({ strict: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

function assignid(req, res, next) {
    req.id = uuidv4();
    next();
}

//Define Routes

app.use('/', require('./routes/pages'));
app.use('/posts/posts', require('./routes/posts'));
app.use('/loggedin', require('./routes/pages'));
app.use('/admin', require('./routes/pages'));
app.use('/posts', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`server up and running on ${PORT}`);
});

//SECURE SERVER OPTIONS

//const serveroptions = {
//    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
//}

//const sslServer = https.createServer(serveroptions, app)

//sslServer.listen(3000,() => console.log('Secure Server on port 3000'));
