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

    // Generate JWT refresh token and set it as an HTTP-only cookie
    const refreshToken = jwt.sign(
      { userId: req.user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY || '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${env.CLIENT_URL}/login?token=${accessToken}`);
  }
);

module.exports = router;
