const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {v4:uuidv4} = require('uuid'); 
const cookieParser = require('cookie-parser');
const Cookies = require('js-cookie');
const session = require('express-session');
const cryptojs = require('crypto-js');
const express = require('express');
const { authenticaterole } = require('../authentication');
//const validator = require('express-validator');
let ID = '0';
let role = '';
let admintag = 1;
app = express();

//app.use(cookieParser());          //Enable Session Management

const db = mysql.createConnection({
    host: process.env.database_host,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database
});

function hasNumber(password){
    return /\d/.test(password);     
}

function emailvalidation(email){
    var regexemail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!(regexemail.test(email))){
        console.log("Failed email validation");
        return -1;
    }
}

function passsword_strength(password){
    var chars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(password.length<9){
        return -1;
    }
    else if(password.toUpperCase() == password){
        return -1;
    }
    else if(password.toLowerCase() == password){
        return -1;
    }

    num = hasNumber(password);
    if(num==false){
        return -1;
    }

    else if(!password.match(chars)){
        return -1;
    }
}

//HAVE TO FIND OUT HOW TO USE COOKIES TO KEEP A USER LOGGED IN

function validate(req,res,next) {
    const {cookie} = req.cookies;
    if('authcookie' in cookies) {
        console.log('S_ID exists');
        if(cookie.authcookie == token){
            next();
        }else{
            res.status(403).send({msg:'unauthourized'});
        }
    }else{
        res.status(403).send({msg:'unauthourized'});
    }
}

exports.home = async (req,res) => {
//    const options = {
//        expires : new Date(Date.now() - process.env.jwt_cookie_expiry)
//    }

    //Cookies.remove('authcookie');
    res.clearCookie('authcookie', {path: ''})//, token, options);
}

exports.admin = async(req,res) => {
    const {id} = req.body;
    if(ID == '21'){
        admintag = authenticaterole(role);
    }
    //if(user.role == 'admin')           Declare an object called user and give it a role attribute - use cookies to authenticate the user?
    console.log(id);
    if(admintag==1){
        db.query("DELETE FROM users WHERE ID = " + parseInt(id),  async(error,result) => {
            if(!result) {
                res.status(401).render('admin', {
                    message: 'ID does not exist'
                });
            }
            else{
                res.status(200).render('admin', {
                    message : 'ID deleted'
                })
            }
        })
    }
    else{
        res.status(401).render('login', {
            message : 'Not admin user'
        });
    }
}

exports.login = async (req,res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){      //check if something has been entered in the email box
            return res.status(400).render('login', {
                message: 'Provide email and password'
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, result) => {
            //console.log(results);
            //decrypted_password_bytes = cryptojs.AES.decrypt(password,'secretkey');
            //var decrypted_password = decrypted_password_bytes.toString(cryptojs.enc.Utf8); 
            if( !result || !(await bcrypt.compareSync(password, result[0].password))) { 
                res.status(401).render('login', {                                    
                    message : 'Incorrect email or password'
                })
            }
            else{
                ID = result[0].id;
                const token = jwt.sign({ID}, process.env.jwt_secret, {   //the secret password is required to make a token for each user
                    expiresIn: process.env.jwt_expiry
                });
                console.log('the token is ' + token);
                cookie = uuidv4();
                //app.use(express.session({secret:process.env.secret, cookie: {httponly:true, secure:true}}));
                const cookieOptions = {
                        //expires : new Date(
                        //Date.now() + process.env.jwt_cookie_expiry*24*60*60*1000),
                       //expires : new Date(Date.now() - process.env.jwt_cookie_expiry)
                     
                        httpOnly : true,   //only let access to cookies if we are on a httponly browser method, prevents cookies being accessed by script
                        secure: true     //cookies only sent on secure https
                }
                res.cookie('authcookie', cookie, cookieOptions, {path: ''});
                //app.get('/loggedin', validate, (req,res) => {
                //    res.cookie('authcookie', token, cookieOptions, {path: ''});
                //    res.status(200);
                //});
                if(ID=='21'){               //user.role again
                    role = 'admin'
                }
                else{
                    role = 'notadmin'
                }
                const tag = authenticaterole(role);
                if(tag==1){
                    res.status(200).redirect('/admin');
                }
                else{
                    res.status(200).redirect('/loggedin');    
                    //res.cookie('authcookie',cookieOptions);  
                }
            }
        })
    }
    catch(error){
        console.log(error);
    }
}

exports.register = async (req,res) => {
    console.log(req.body);

    const {name,email,password,passwordrepeat} = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {          //the question mark is to prevent sql injection : need to find out why
        if(error){
            console.log(error);
        }
        if(result.length > 0){
            return res.render('register' , {
                message: 'That Email has already been registered'
            })
        } else if(emailvalidation(email) === -1){
            return res.render('register');
        }
        else if( password !== passwordrepeat ) {
            return res.render('register', {
                message: 'Passwords do not match'
            }) 
        } else if(passsword_strength(password) == -1) {
            return res.render('register', {
                message: 'Passwords need to be a mix of uppercase, lowecase, numbers and special characters OR Password not strong enough; Try adding more number and special characters'
            })
        }

        var cipherpassword = cryptojs.AES.encrypt(password, 'secretkey').toString();
        console.log(cipherpassword);

        var salt = bcrypt.genSaltSync();    
        let hashed_password = await bcrypt.hashSync(password, salt);   //a secure password usually has 8 rounds of encryption-here it is salted
        //let hashed_password = await bcrypt.hashSync(cipherpassword,salt);
        console.log(hashed_password);
        
        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashed_password}, (error, results) => {
            if(error){
                console.log(error);
            }
            else{
                console.log(results)
                return res.render('register', {
                    message: 'user registered'
                });
            }
        })
    });   
}