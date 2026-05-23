const express = require("express");
const router = express.Router();

router.get('/',(_,res)=>{
    res.render('index', { title: 'Hey', message: 'Hello there!' });
});
router.get('/login',(_,res)=>{
    res.render('login', { 
        self: 'Hey', 
        time: 'Hello there!',
        rand: 'Hey', 
        name: 'Hello there!',
        nameErr: 'Hey', 
        pass: 'Hello there!', 
        passErr: 'Hey'
    });
});
router.get('/register',(_,res)=>{
    res.render('register', { 
        self: 'Hey', 
        time: 'Hello there!',
        rand: 'Hey', 
        name: 'Hello there!',
        nameErr: 'Hey', 
        pass: 'Hello there!', 
        passErr: 'Hey', 
        email: 'Hello there!', 
        emailErr: 'Hey'
    });
});
module.exports = router;