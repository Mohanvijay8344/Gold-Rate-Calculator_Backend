// All Require;
const express = require('express');
const mongoDB = require('mongodb');
const MongoClient = mongoDB.MongoClient;
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const API = express();
require("dotenv").config();
const URL =process.env.LINK;
const DB =process.env.DB;
var nodemailer = require('nodemailer');
const FROM = process.env.FROM;
const PASSWORD = process.env.PASSWORD

//Middleware;
API.use(express.json());
API.use(cors())

//Conform to Working API;
API.get("/", function (req, res) {
    res.send('<h1>Make a Way..</h1>')
});

const PORT = 7000;

//New User registration;

async function genrateHashedPassword(Password) {
    const NO_OF_ROUNDS = 10;
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const HashedPassword = await bcrypt.hash(Password, salt);
    return HashedPassword;
}

API.post("/Register", async function (request, response) {
    try{
        const { Username, Email, Password } = request.body;
        const client = new MongoClient("URL"); // dial
                // Top level await
                await client.connect(); // call    
                console.log("Mongo is connected !!!  ");
        const userfromdb = await client
          .db("b42wd2")
          .collection("users")
          .findOne({ Email: Email });
      
        if (userfromdb) {
          response.json({ status: "user already exists" });
        } else {
          const HashedPassword = await genrateHashedPassword(Password);
          const result = await client.db("b42wd2").collection("users").insertOne({
            Username: Username,
            Email: Email,
            Password: HashedPassword,
          });
          response.json({ status: "succesfully signup🎉🎉" });
        }
    }
    catch{
        response.status(404).json({ Message: 'Something Went Wrong' })
    }

  });



//Login && Login Verification;

API.post("/login", async function (request, response) {
    try{
        const { Password, Email } = request.body;
      
        const client = new MongoClient("URL"); // dial
                // Top level await
                await client.connect(); // call    
                console.log("Mongo is connected !!!  ");

        const getUserByName = async function getUserByName(Email) {
        return await client.db("b42wd2").collection("users").findOne({ Email: Email });
        }
        
        const userFromDb = await getUserByName(Email);
        console.log(userFromDb);
        
    if (!userFromDb) {
      return response.status(400).send({ message: "Invalid credentials" });
    } else {
      const storedDbPassword = userFromDb.Password;
      console.log(storedDbPassword)
      const isPasswordCheck = await bcrypt.compare(Password, storedDbPassword);
      console.log(isPasswordCheck);
  
      if (isPasswordCheck) {
        const token = jwt.sign({id: userFromDb._id}, process.env.SECURITY_KEY)
        response.status(200).send({message: "Successfull Login", token: token})
        console.log(token)
      }else{
        response.status(404).send({message: "Invalid Creds"})
      }
    }
    }
    catch (error) {
        response.status(404).json({ Message: 'Something Went Wrong' })
        console.log(error);
    }
    
});


API.post(
    "/forgot-password",
    express.json(),
    async function (request, response) {
     
      try {
        const { Email } = request.body;
        const client = new MongoClient("URL"); // dial
                // Top level await
                await client.connect(); // call    
                console.log("Mongo is connected !!!  ");
        const userfromdb = await client
          .db("b42wd2")
          .collection("users")
          .findOne({ Email: Email });
  
        if (!userfromdb) {
          response.json({ status: "user already exists" });
        }
        const secret = process.env.SECURITY_KEY + userfromdb.password;
        const token = jwt.sign(
          { Email: userfromdb.Email, id: userfromdb._id },
          secret,
          { expiresIn: "5m" }
        );
        const link = `http://localhost:5173/reset-password?id=${userfromdb._id}&token=${token}`;
  
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: FROM,
            pass: PASSWORD,
          },
        });
  
        // setup email data with unicode symbols
        let mailOptions = {
          from: FROM, // sender address
          to: userfromdb.Email, // list of receivers
          subject: "forgot password reset flow using nodejs and nodemailer", // Subject line
          // plain text body
          html: `<a href=${link}>click here</a>`,
        };
  
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
          response.status(200).json();
        });
  
        console.log(link);
      } catch (error) {
        console.log(error)
      }
    }
  );
  
  API.get("/reset-password/:id/:token", async function (request, response) {
    const { id, token } = request.params;
    console.log(request.params);
    const client = new MongoClient("URL"); // dial
                // Top level await
                await client.connect(); // call    
                console.log("Mongo is connected !!!  ");
    const userfromdb = await client
      .db("b42wd2")
      .collection("users")
      .findOne({ _id: id });
  
    if (!userfromdb) {
      response.send({ message: "user not exists" });
    }
    const secret = process.env.JWT_SECRET + userfromdb.password;
    try {
      const verify = jwt.verify(token, secret);
      response.render("index", { email: verify.email });
    } catch (error) {
      console.log(error);
      response.send({ message: "not verified" });
    }
  });



//Get All data of city,and GOld rate's
API.get('/All_Data',async function(req,res){
    try {
        const client = new MongoClient("mongodb+srv://Mohan1997:9876543210@cluster0.ns9ghot.mongodb.net"); // dial
        // Top level await
        await client.connect(); // call    
        console.log("Mongo is connected !!!  ");
        let data = await client.db("b42wd2").collection("Gold").find({}).toArray()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({Message:"Something Went wrong"})
        console.log(error);
    }
})

//Rate card Data
API.get('/Rate_card',async function(req,res){
    try {
        const client = new MongoClient("mongodb+srv://Mohan1997:9876543210@cluster0.ns9ghot.mongodb.net"); // dial
        // Top level await
        await client.connect(); // call    
        console.log("Mongo is connected !!!  ");
        let data = await client.db("b42wd2").collection("Today").find({}).toArray()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({Message:"Something Went wrong"})
        console.log(error);
    }
})

//PORT Listen;
// API.listen(process.env.PORT || 7000);
API.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));