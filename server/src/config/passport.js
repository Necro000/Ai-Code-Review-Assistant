const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { prisma } = require('./db');
const env = require('./env');

passport.use(new GitHubStrategy(
  {
    clientID:     env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackURL:  `${env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
    scope: ['user:email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email    = profile.emails?.[0]?.value;
      const githubId = profile.id.toString();

      let user = await prisma.user.findFirst({
        where: { OR: [{ githubId }, { email }] },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name:      profile.displayName || profile.username,
            email:     email || `${githubId}@github.noemail`,
            password:  '', // OAuth users don't have password
            githubId,
            avatarUrl: profile.photos?.[0]?.value || null,
          },
        });
      } else if (!user.githubId) {
        // Link github profile if email already exists
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { githubId, avatarUrl: profile.photos?.[0]?.value },
        });
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

module.exports = passport;
