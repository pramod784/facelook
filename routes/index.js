var express = require('express');
var router = express.Router();
const { client } = require('./../lib/mongo_connect');
const { emit } = require('../app');
/* GET home page. */
router.get(['/','/login'], function(req, res, next) {
  res.render('login', { title: 'Welcome to facelook' });
});
router.post('/login', async function(req, res, next) {
  console.log("Register body",req.body);
  let username = req.body.username;
  let password = req.body.password;

  const db = client.db("facelook-db");
  const users = db.collection("users");

  const result = await users.findOne({
    username, password
  });

  if(result){
    req.session.user = {
      user_id: result._id,
      username: result.username,
      email: result.email
    };

    console.log("Session created:", req.session.user);

    console.log(`User logged in successfully ${result}`);
    //res.send(result);
    res.redirect('/feed');
  }else{
    console.log("User login failed");
    res.send("User login failed. Please try again.");
  }
});

router.get('/logout', function (req, res, next) {
  // logout logic

  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.user = null
  req.session.save(function (err) {
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/')
    })
  })
})

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Welcome to facelook' });
  //res.render('facelook_template', { title: 'Welcome to facelook' });
});
router.post('/register', async function(req, res, next) {
  console.log("Register body",req.body);
  let fullname = req.body.fullname;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let qualifications = "MCA";
  
  
  const db = client.db("facelook-db");
  const users = db.collection("users");

  const result = await users.insertOne({
    fullname, email, username, password,"edcucation": qualifications,
    createdAt: new Date()
  });

  if(result.insertedId){
    console.log(`User registered successfully ${result.insertedId}`);
    res.send(`User registered successfully ${result.insertedId}`);    
  }else{
    console.log("User registration failed");
    res.send("User registration failed. Please try again.");
  }
});

router.get('/create-post', function(req, res, next) {
  res.render('create-post', { title: 'Welcome to facelook' });
});

router.post('/create-post', async function(req, res, next) {
  if(!req?.body?.content){
    return res.send("Post content is required.");
  }
  let content = req.body.content;
  let user_id = req.session.user.user_id;
  let username = req.session.user.username;

  const db = client.db("facelook-db");
  const posts = db.collection("posts");

  const result = await posts.insertOne({
    user_id, username, content, createdAt: new Date()
  });

  if(result.insertedId){
    return res.redirect('/feed');
    
    console.log(`Post created successfully ${result.insertedId}`);
    res.send(`Post created successfully ${result.insertedId}`);    
  }else{
    console.log("Post creation failed");
    res.send("Post creation failed. Please try again.");
  }
});

router.get('/feed', function(req, res, next) {

  if(!req?.session?.user?.username ){
    console.log("User not logged in, redirecting to login page.");
    return res.redirect('/login');
  }
  
  const db = client.db("facelook-db");
  const posts = db.collection("posts");
  
  posts.find().sort({createdAt:-1}).toArray().then((postsFromDB) => {
    res.render('feed', { title: 'Welcome to facelook', posts: postsFromDB , username: req.session.user.username }) ;
  }).catch((err) => {
    console.error("Failed to fetch posts from database:", err);
    res.send("Failed to load feed. Please try again later.");
  });


  // let postsss = [
  //   {username: 'Pramod Yewale', content: 'Hello World! This is my first post.'},
  //   {username: 'Jane Doe', content: 'Enjoying the sunny weather today.'},
  //   {username: 'John Smith', content: 'Just finished a great book on JavaScript.'},
  //   {username: 'Alice Johnson', content: 'Had an amazing time hiking this weekend!'},
  //   {username: 'Bob Brown', content: 'Cooking up a storm in the kitchen tonight.'},
  //   {username: 'Charlie Davis', content: 'Learning to play the guitar is so much fun!'},
  //   {username: 'Diana Evans', content: 'Just adopted a cute puppy!'},
  //   {username: 'Frank Green', content: 'Watching a classic movie marathon.'},
  //   {username: 'Grace Harris', content: 'Baking cookies for my friends.'}
  // ];
  
  // res.render('feed', { title: 'Welcome to facelook', posts: postsss , username: req.session.user.username }) ;
  //res.render('facelook_template', { title: 'Welcome to facelook' });
});

router.get('/chat', function(req, res, next) {
  res.render('feed', { title: 'Welcome to facelook',username: req.session.user.username }) ;
  //res.render('facelook_template', { title: 'Welcome to facelook' });
});
module.exports = router;