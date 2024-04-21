const router = require("express").Router();
const UserData = require("../models/Userdata");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verified = require("../verify/verifyToken");
const Admin = require("../models/Admin");
const secretKey = process.env.SecretKey;



router.get("/getUsers", async (req, res) => {
  const user = new UserData({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    gender: req.body.gender,
  });

  try {
    const TotalUser = await UserData.find();
    res.status(200).json({ message: TotalUser });
  } catch (err) {
    res.status(500).json({ message: err });
  } 
});

const createToken = (_id) => {
  return jwt.sign({ _id }, secretKey, { expiresIn: "3d" });
}; 

router.post("/signup", async (req, res) => {
  const { username, email, password, gender } = req.body;
  const Salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, Salt);

  console.log(hashPassword);

  const result = await UserData.findOne({ email: email });
  if (result) return res.status(500).json({message : "Email Already exists"});
  

  const user = new UserData({
    username: username,
    email: email,
    password: hashPassword,
    gender: gender,
  });

  const token = createToken(user._id);
  user.token = token;  

  try {
    const AddedUser = await user.save();
    res
      .status(200)
      .json({
        message: `${username} Signup Successfully`,
        UserDetails: AddedUser,
      });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body; 
  try {  
    const result = await UserData.findOne({ email: email});
    if (!result)
      return res
        .status(500) 
        .json({ message: "Email is not registered, Kindly Register first!!!" });
    const hashPassword = await bcrypt.compare(password, result.password);
    if (!hashPassword)
      return res.status(500).json({ message: "Password is wrong" });

    const token = createToken(result._id); // Generate a new token
    result.token = token; // Save the token to the user document

    await result.save(); // Save the user document with the new token
    console.log(token)
    res.status(200).json({ message: `${result.username} Login Successfully`, email: email, username : result.username }); // Send the token back to the client
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
}); 



// Admin


router.post('/admin/signup', async (req, res) => {
  try {
      const { username, email, password } = req.body;
      const isAdmin = true; // Assuming this is a new admin
      const newAdmin = new Admin({ username, email, password, isAdmin });
      await newAdmin.save();
      res.status(201).send({message : "Admin Login Successful"});
  } catch (error) {
      res.status(400).send(error);
  }
});


router.post('/admin/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email, password });
      if (!admin) {
          return res.status(404).send({ error: 'Admin not found' });
      }
      res.send(admin);
  } catch (error) {
      res.status(400).send(error);
  }
});


module.exports = router;
