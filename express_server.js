const express = require("express")
const cookieParser = require("cookie-parser")

const app  = express()
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const { render } = require("ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

function generateRandomString() {
  //generate a 6 alpha numeric character
let newShortURL = Math.random().toString(36).substr(2, 6)
return newShortURL;
}



const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
   id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function emailAlreadyExists(submittedEmail){
  for (const user in users) {
    if (users[user.email] === submittedEmail) {
      return true;
    } 
  }
  return false;
}
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
    },

  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
    }
};
  let userSpecificURLDatabase = {};

function urlsForUser(userIDFromCookie){
  // userSpecificURLDatabase = {};

  for (const shortURL in urlDatabase) {
    // console.log(urlDatabase[url]["userID"]);
    if (userIDFromCookie === urlDatabase[shortURL]["userID"]) {
      userSpecificURLDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  if (userSpecificURLDatabase) {
    return userSpecificURLDatabase
  } else{
    return false;
  }
}

///////////////////////////////////*this is for the URLS page*/
app.get("/urls", (req, res) => {
  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.cookies["user_id"];

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  const templateVars = { urls: userSpecificURLDatabase, user: req.cookies["user_id"], registeredUsers: users };
  if (!Object.keys(req.cookies).length) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }

  res.render("urls_index", templateVars); 
});
  // }


app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = { 
                                "longURL" : req.body.longURL,
                                "userID" : req.cookies["user_id"] 
                              }
  console.log(urlDatabase);

  // urlDatabase[tempShortURL]["longURL"] = req.body.longURL;
  // urlDatabase[tempShortURL]["userID"] = req.cookies[user_id];


  res.redirect("/urls/" + tempShortURL);         // Respond with 'Ok' (we will replace this)
});

///////////////////////////////////URLS/new page
app.get("/urls/new", (req, res) => {
  if (!Object.keys(req.cookies).length) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  };

  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.cookies["user_id"];

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  
  // console.log(req.cookies);
  // console.log(users);
  // console.log(users[req.cookies["user_id"]]["email"]);

  const templateVars = { urls: userSpecificURLDatabase, user: req.cookies["user_id"], registeredUsers: users };
  
  res.render("urls_new", templateVars);

});

///////////////////////////////////URLSshort page
app.get("/urls/:shortURL", (req, res) =>{
  if (!Object.keys(req.cookies).length) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;

  };
  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.cookies["user_id"];

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);
  
  
  const templateVars = {shortURL: req.params.shortURL, longURL: userSpecificURLDatabase[req.params.shortURL]["longURL"], user: req.cookies["user_id"], registeredUsers: users };
  // console.log(req.cookies + "<<< this is from /urls/:shortURL ");
  res.render("urls_show", templateVars);
})
app.post("/urls/:shortURL", (req, res) => {


  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.cookies["user_id"];

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  
  userSpecificURLDatabase[req.params.shortURL]["longURL"] = req.body.longURL
  res.redirect("/urls");
})

app.get("/urls/:shortURL/delete", (req, res) => {
  res.status(401).send("<html> <head>Server Response</head><body><h1> You cannot delete using this method, redirect to the <a href='/urls'>main page</a></h1></body></html>");

  res.redirect("/urls");
  return;

});

app.post("/urls/:shortURL/delete", (req, res) => {

  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.cookies["user_id"];
  
  // userSpecificURLDatabase = urlsForUser(userIDFromCookie);
  // const templateVars = { urls: userSpecificURLDatabase, user: req.cookies["user_id"], registeredUsers: users };
  // console.log(userSpecificURLDatabase);
  // console.log(userSpecificURLDatabase[req.params.shortURL]);
  console.log("***************")
  console.log(urlDatabase[req.params.shortURL], userIDFromCookie);


  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === userIDFromCookie) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");         
    return;
  } else {
    res.status(401).send("<html> <head>Server Response</head><body><h1> Cannot delete that which does not exist, you will be transferred to the <a href='/urls'>main page</a></h1></body></html>");

  }
  
  
  // console.log(urlDatabase);
});
app.get("/u/:shortURL", (req, res) => {
  // if (!Object.keys(req.cookies).length) {
  //   res.redirect("/login");
  //   return;
  // };

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});
//////////////////////registration page
app.get("/register", (req, res) => {

    if (Object.keys(req.cookies).length) {
    res.redirect("/login");
    return;
  };

  const templateVars = { urls: urlDatabase, user: req.cookies[users.id], registeredUsers: users};
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  // console.log("request received");
  if (!req.body.email || !req.body.password) {
    console.log("entered the if statement")
    res.status(400).send("Either the email or password is missing, please fill it out");
    return;
  }
  else if (emailAlreadyExists(req.body.email)) {
    res.status(400).send("This email already exists");
    res.status(400).send("<html> <head>Server Response</head><body><h1> This email already exists, please click on the <a href='/login'>login page</a></h1></body></html>");

    return;
  };

  let newID = generateRandomString();

  //saving the newly registered user into the user database
  users[newID] =   {
    id : newID,
    email : req.body.email, 
    password : req.body.password
  }

  res.cookie("user_id", newID);
  res.redirect("/urls");

});
/////////////////////LOGIN PAGE & BUTTONS
app.get("/login", (req, res) => {

  res.render("login", {user: req.cookies[users.id]});
});


app.post("/login", (req, res) =>{
  //add the  login to the cookie objects from the form
  //put the email and password in a variable
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  console.log(submittedEmail + "<< this is email from the form");
  console.log(submittedPassword + "<< this is password from the form");
//  user2@example.com
//  dishwasher-funk

  // let authorizer = null;

  let foundUser = false;

  let desiredUser = {};

  for (const user in users) {
    foundUser = users[user]['email'] === submittedEmail && users[user]['password'] === submittedPassword;
    if(foundUser){
      desiredUser = user;
      break;
    }
  };
  console.log(desiredUser);

  if(foundUser){
    res.cookie("user_id", desiredUser);    
    res.redirect('/urls')
  } else{
    //show the erorr
    authorizer = false;
    res.status(403).send("Either the email or password doesn't match"); 
  }
    // console.log(users[user]["email"]);
    // console.log(users[user]["password"]);
    // if ((users[user]["email"] === submittedEmail) && 
    //     (submittedPassword === users[user]["password"])) {
    //   console.log(users[user]["email"] + " >>printing users[user][\"email\"\]");
    //   authorizer = true;
    //   if (authorizer){
    //    break;
    // }
    // }
    // else {
    //   authorizer = false;
    //   res.status(403).send("Either the email or password doesn't match"); 
    //   setTimeout(function(){ res.redirect("/login"); }, 3000);
    // }      
    // if (users[user]["password"] === submittedPassword) {
    //   console.log(users[user]["password"] + " >>printing users[user][\"password\"\]");
    //   authorizer = true;
    //   res.redirect("/urls");
    //   return;
  // }
  // console.log(users[user].submittedEmail + " >>>>submitted from the form");
  // console.log(users[user]["email"] + " from the userDatabse")

  //check if the user is inside the userDatabase
  // for (const user in users) {
  //   if ((submittedEmail === users[user]["email"]) &&
  //       (submittedPassword === users[user]["password"])) {
  //       } else {
  //       }
  // }
  // res.cookie("user_id", );
  // res.redirect("/urls");
  //save the new user email & password;
});
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});





app.get("/hello", (req, res) => {
  if (!Object.keys(req.cookies).length) {
    res.redirect("/login");
    return;
  };

  const templateVars = { greeting: 'Hello World!', user: req.cookies[users.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
