const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { prisma } = require('./db');
const env = require('./env');

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
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
        const avatarUrl = profile.photos?.[0]?.value || profile._json?.avatar_url || null;

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
              avatarUrl,
            },
          });
        } else {
          // Link github profile if missing and sync avatarUrl
          const updateData = {};
          if (!user.githubId) {
            updateData.githubId = githubId;
          }
          if (avatarUrl && user.avatarUrl !== avatarUrl) {
            updateData.avatarUrl = avatarUrl;
          }

          if (Object.keys(updateData).length > 0) {
            user = await prisma.user.update({
              where: { id: user.id },
              data:  updateData,
            });
          }
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));
} else {
  console.warn('⚠️ GitHub OAuth credentials not found. GitHub Strategy is disabled.');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

module.exports = passport;
