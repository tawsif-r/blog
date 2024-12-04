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

    try {
        const locals = {
            title:"Dashboard",
            description: "Simple blog created with Nodejs, Express & MongoDB."
        };
        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data,
            layout:adminLayout
        });
    } catch (error) {
        console.log(error);
    }


    
});

// GET
//admin create new post 
router.get('/add-post/',authMiddleware,async (req,res)=>{

    try {
        const locals = {
            title:"Dashboard",
            description: "Simple blog created with Nodejs, Express & MongoDB."
        };
        const data = await Post.find();
        res.render('admin/add-post',{
            locals,
            data,
            layout:adminLayout
        });
    } catch (error) {
        console.log(error);
    }


    
});


// POST
//admin create new post 
router.post('/add-post',authMiddleware,async (req,res)=>{

    
    try {
        console.log(res.body);
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard/');
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }


    
});



// GET
//admin update post
router.get('/edit-post/:id',authMiddleware,async (req,res)=>{

    
    try {
        const locals = {
            title:"Edit Post",
            description: "Simple blog created with Nodejs, Express & MongoDB."
        };
        const data = await Post.findOne({_id:req.params.id});
        res.render('admin/edit-post',{
            locals,
            data,
            layout:adminLayout
        })

    } catch (error) {
        console.log(error);
    }


    
});

// PUT
//admin update post
router.post('/edit-post/:id',authMiddleware,async (req,res)=>{

    
    try {
        
        await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body: req.body.body,
            updataAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }


    
});



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







 /*
 Delete
 Admin - Delete Post(doing it with route.post then delete)
 */
router.post('/delete-post/:id', authMiddleware,async(req,res)=>{
    try{
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
})




/*
Admin logout
GET
*/
router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/');
});



module.exports = router;