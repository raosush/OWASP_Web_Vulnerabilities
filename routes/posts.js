const express = require('express');
const router = express.Router();
const xss = require('../xssMitigation');
const csrf = require('csurf');
// Prevent access of CSRF Token via a script & cookies are to be sent in a first-party context. 
var csrfProtection = csrf({ cookie: {httpOnly: true, sameSite: 'strict'} });
const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({ extended: false });

const addCsrf = (req, res, next) => {
    if (req.headers['content-type'] === 'application/xml' || req.headers['accept'] === 'application/xml') {
        next();
    } else {
        csrfProtection(req, res, next);
    }
}

var index = (req, res) => {
    let query = "SELECT * FROM posts";
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.render('index2.ejs', {
                title: 'NodeJS',
                posts: result
            });
        });   
    })
}

var addPostForm = (req, res) => {
    res.render('addPost.ejs', {
        title: 'Add a new Post',
        message: '',
        csrfToken: req.csrfToken()
    });
}

var addPost = (req, res) => {
    let title = xss(req.body.title || req.body.post.title[0]);
    let content = xss(req.body.content || req.body.post.content[0]);
    let query = "INSERT INTO `posts` (title, content) VALUES (?, ?)";
    if (title === '[object Object]' || content === '[object Object]') {
        return res.status(403).json('Incorrect URL encountered!')
    }
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, [title, content], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.redirect('/');
        });        
    })
}

var editPostForm = (req, res) => {
    let postId = req.params.id;
    let query = "SELECT * FROM `posts` WHERE id = ? LIMIT 1";
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, [postId], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.render('editPost.ejs', {
                title: 'Edit Post',
                post: result[0],
                message: '',
                csrfToken: req.csrfToken()
            });
        })  
    });
}

var editpost = (req, res) => {
    let postId = req.params.id;
    let title = xss(req.body.title);
    let content = xss(req.body.content);
    let query = "UPDATE `posts` SET `title` = ?, `content` = ? WHERE `posts`.`id` = ?";
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, [title, content, postId], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    });
}

var deletePost = (req, res) => {
    let postId = req.params.id;
    let query = 'DELETE FROM posts WHERE id = ?';
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, [postId], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    });
}

var showPost = (req, res) => {
    let postId = req.params.id;
    let query = "SELECT * FROM `posts` WHERE id = ? LIMIT 1";
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, [postId], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.render('show.ejs', {
                title: 'View Post',
                post: result[0]
            });
        });
    });
}

router.get('/', csrfProtection, index);
router.get('/addPost', csrfProtection, addPostForm);
router.post('/addPost', parseForm, addCsrf, addPost);
router.get('/editPost/:id', csrfProtection, editPostForm);
router.post('/editPost/:id', parseForm, addCsrf, editpost);
router.get('/deletePost/:id', csrfProtection, deletePost);
router.get('/showPost/:id', csrfProtection, showPost);
module.exports = router;