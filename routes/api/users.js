const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");

// Import User Model
const User = require("../../models/User");

// @route     POST api/users
// @desc      Register user
// @access    Public
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),

    check(
      "password",
      "please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If info is not correct, sent back a bad request error
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, avatar, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }
      // Get userse gravatar (based on their email)
      // s - size
      // r - rating
      // d - default image
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Don't forget anything that returns a promise should have await instead of .then() chain
      await user.save();

      // Return jsonwebtoken
      res.send("User registered");
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
