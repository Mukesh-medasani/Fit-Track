const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO NEO4J
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// TEST ROUTE
app.get("/", (req,res)=>{
  res.send("Backend running 🚀");
});

// SIGNUP
app.post("/signup", async (req,res)=>{
  console.log("REQ BODY:", req.body);   // 👈 ADD THIS

  const {user,pass} = req.body;
  const session = driver.session();

  try{
    await session.run(
      "CREATE (u:User {username:$user, password:$pass})",
      {user,pass}
    );
    res.json({message:"User created"});
  }catch(e){
    console.log("NEO4J ERROR:", e);   // 👈 IMPORTANT
    res.json({message:"Error"});
  }finally{
    session.close();
  }
});

// LOGIN
app.post("/login", async (req,res)=>{
  const {user,pass} = req.body;
  const session = driver.session();

  try{
    let result = await session.run(
      "MATCH (u:User {username:$user, password:$pass}) RETURN u",
      {user,pass}
    );

    if(result.records.length>0){
      res.json({success:true});
    }else{
      res.json({success:false});
    }
  }catch(e){
    console.log(e);
    res.json({success:false});
  }finally{
    session.close();
  }
});

// TEMP TEST ROUTE
app.post("/health", (req,res)=>{
  console.log("Health data:", req.body);
  res.json({status:"received"});
});

app.listen(3000, ()=>{
  console.log("Server running on port 3000");
});