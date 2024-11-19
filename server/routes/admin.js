const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;






/*
   * 
   * Admin - check page
*/

const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({message:'Unauthorized'})
    }
    try{
        const decoded = jwt.verify(token,jwtSecret);
        res.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({message:'Unauthorized'});
    }
}


/*
   * GET /
   * Admin - login page
*/
router.get('/admin/', async(req,res) =>{
  
    try {
 
        const locals = {
            title:"admin",
            description: "Simple blog created with Nodejs, Express & MongoDB."
        }
 
 
        res.render('admin/index',{locals,layout: adminLayout });
        } catch (error) {
            console.log(error);
    }
 });


 /*
   * POST /
   * Admin - check login
*/
router.post('/admin',async (req,res) => {
    try {
        const {username,password} = req.body;

        const user = await User.findOne({username});

        if (!user){
            return res.status(401).json({message: 'Invalid User'});
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.statusMessage(401).json({message: 'Invalid Password'});
        }
        const token = jwt.sign({userid:user._id},jwtSecret);

        res.cookie('token',token,{httpOnly:true});

        res.redirect('/dashboard');
}catch(error){
    console.log(error);
}
});

// check login before directing to the dashboard

router.get('/dashboard/',authMiddleware,async (req,res)=>{
    res.render('admin/dashboard');
});






 /*
   * POST /
   * Admin - check login
*/


// router.post('/admin/', async(req,res) =>{
  
//     try {
//         const {username,password} = req.body;
//         if( req.body.username === "admin" && req.body.password === 'password'){
//             res.send('You are logged in');
//         }else{
//             res.send('Invalid username or password');
//         }
 
//         res.redirect('/admin')
//         } catch (error) {
//             console.log(error);
//     }
//  });


  /*
   * POST /
   * Admin - Register
*/

router.post('/register/', async(req,res) =>{
  
    try {
        const {username,password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10);

        try {
            const user = await User.create({username,password:hashedPassword});
            res.status(201).json({message: 'User created',user});
        }catch(error){
            if(error.code === 11000){
                res.status(409).json({message: 'User already in use'});
            }
            res.status(500).json({message:'internal server error'})
        }

        } catch (error) {
            console.log(error);
    }
 });

module.exports = router;