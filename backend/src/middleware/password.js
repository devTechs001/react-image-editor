// backend/src/middleware/passport.js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const config = require('../config/app');

module.exports = (passport) => {
  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        
        if (!user) {
          return done(null, false);
        }

        if (!user.isActive) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select('+password');

          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is deactivated' });
          }

          const isMatch = await user.comparePassword(password);

          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/v1/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ 'socialLinks.google': profile.id });

            if (!user) {
              user = await User.findOne({ email: profile.emails[0].value });

              if (user) {
                user.socialLinks.google = profile.id;
                await user.save();
              } else {
                user = await User.create({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  avatar: profile.photos[0]?.value,
                  socialLinks: { google: profile.id },
                  isVerified: true,
                  password: require('crypto').randomBytes(32).toString('hex')
                });
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};