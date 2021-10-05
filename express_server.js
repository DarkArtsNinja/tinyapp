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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

///////////////////////////////////*this is for the URLS page*/
app.get("/urls", (req, res) => {

  // const userId = req.session['user_Id'];
  // const currentUser = users[userId];
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"], registeredUsers: users };
  console.log(req.cookies);
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = req.body.longURL
  res.redirect("/u/" + tempShortURL);         // Respond with 'Ok' (we will replace this)
});

///////////////////////////////////URLS/:shortURL page
app.get("/urls/:shortURL", (req, res) =>{
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies[users.id] };
  console.log(req.cookies);
  res.render("urls_show", templateVars);
})
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL  ];
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
  // console.log(urlDatabase);
});
//////////////////////registration page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies[users.id]};
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

  let authorizer = null;

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




app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies[users.id] };
  
  res.render("urls_new", templateVars);

});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!', user: req.cookies[users.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
