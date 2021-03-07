const express = require('express');
const Cookies = require('js-cookie');
const router = express.Router();

router.get('/', (req,res) => {
    res.render('index');
  //  res.clearCookie('authcookie');
});

router.get('/posts', (req,res) => {
    res.render('posts');
})

router.get('/index2', (req,res)=> {
    res.render('index2');
})

router.get('/register', (req,res) => {
    res.render('register');
});

router.get('/login', (req,res) => {
    res.render('login');
})

router.get('/loggedin', (req,res) => {
    res.render('loggedin');
})

router.get('/admin', (req,res) => {
    res.render('admin');
})

module.exports = router;