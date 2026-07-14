const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const router = express.Router();

// Step 1: Redirect to GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Step 2: Callback
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => {
    // Generate JWT access token
    const accessToken = jwt.sign(
      { userId: req.user.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );
    res.redirect(`${env.CLIENT_URL}/login?token=${accessToken}`);
  }
);

module.exports = router;
