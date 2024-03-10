const express = require("express");
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const router = express.Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "Shishir@123";
const fetchuser=require("../middleware/fetchuser");
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Name must be atleast 3 characters").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success=false;
    console.log("done");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        console.log(user);
        return res
          .status(400)
          .json({ success,error: "Sorry a user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        email: req.body.email,
        name: req.body.name,
        password: secpass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const auth_token = jwt.sign(data, JWT_SECRET);
      //console.log(jwtData);
      //res.json({ Status: "Created Successfully", user: user });
      success=true;
      res.json({ success,auth_token: auth_token });
    } catch (error) {
      console.log(error);
      res.status(500).send(success,error);
    }
  }
);
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res
          .status(500)
          .json({success, error: error.message });
      }
      const passcomp = await bcrypt.compare(password, user.password);
      if (!passcomp) {
        console.log("Passeord not correct")
        return res
          .status(500)
          .json({success, error: error.message });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const auth_token = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, auth_token: auth_token });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({success, error: error.message });
    }
  }
);
router.post("/getuser", fetchuser,async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
