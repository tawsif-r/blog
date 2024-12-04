const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Routes

/* 
GET
HOME
*/

router.get('/',async (req,res)=>{
    try {
        const locals = {
            title : "Nodejs blog",
            description: " a simple blog made with node.js and mongodb"
        };
        const perPage = 5;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * perPage;

        // Run queries in parallel using Promise.all
        const [data, count] = await Promise.all([
            Post.aggregate([
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: perPage }
            ]).option({ maxTimeMS: 20000 }), // Increased timeout to 20 seconds
            
            Post.countDocuments()
        ]);
        // Calculate pagination values
        const totalPages = Math.ceil(count / perPage);
        const nextPage = page + 1;
        const hasNextPage = nextPage <= totalPages;

        res.render("index", {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            totalPages,
            count,
            currentRoute:'/'
        });
    }catch(error){
        console.log(error);
    }
    
});


/*
    * GET /
    * Post :id
*/

router.get('/post/:id', async(req,res) =>{
    
    try {

        let slug = req.params.id;

        const data = await Post.findById({_id: slug});

        const locals = {
            title: data.title,
            description: "Simple blog created with Nodejs, Express & MongoDB."
        }

        res.render('post',{
            locals,
            data,
            currentRoute:`/post/${slug}`
        });
        } catch (error) {
            console.log(error);
    }
});



/*
    * POST /
    * Post - searchTerm
*/
router.post('/search',async (req,res)=>{
    
    try {


        const locals = {
            title : "Search",
            description: " a simple blog made with node.js and mongodb"
        };

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

        const data = await Post.find({
            $or: [
                {title: {$regex: new RegExp(searchNoSpecialChar,'i')}},
                {body:{ $regex: new RegExp(searchNoSpecialChar,'i')}}
            ]
        });


        res.render('search',{
            data,
            locals
        });

    }catch(error){
        console.log(error);
    }
 });





router.get('/about',(req,res)=>{
    res.render('about',{
        currentRoute:'/about'
    });
});




module.exports = router;