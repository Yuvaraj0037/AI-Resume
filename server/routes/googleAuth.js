const passport = require(
  "passport"
);

const GoogleStrategy = require(
  "passport-google-oauth20"
).Strategy;

const jwt = require(
  "jsonwebtoken"
);

const User = require(
  "../models/User"
);

const serverUrl =
  process.env.SERVER_URL ||
  "http://localhost:5000";

const clientUrl =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env
          .GOOGLE_CLIENT_ID,

      clientSecret:
        process.env
          .GOOGLE_CLIENT_SECRET,

      callbackURL:
        `${serverUrl}` +
        "/api/auth/google/callback",
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const googleId = String(
          profile?.id || ""
        ).trim();

        const email = String(
          profile?.emails?.[0]
            ?.value || ""
        )
          .trim()
          .toLowerCase();

        const name =
          String(
            profile?.displayName ||
              "Google User"
          ).trim() ||
          "Google User";

        if (!googleId) {
          return done(
            new Error(
              "Google did not provide a user ID"
            )
          );
        }

        if (!email) {
          return done(
            new Error(
              "Google did not provide an email address"
            )
          );
        }

        /*
         * First check whether this Google
         * account is already connected.
         */
        let user =
          await User.findOne({
            googleId,
          });

        /*
         * If not found by Google ID, check
         * whether a normal account already
         * uses the same verified email.
         */
        if (!user) {
          user =
            await User.findOne({
              email,
            });
        }

        if (!user) {
          /*
           * Create a new Google account.
           * Google has already confirmed
           * ownership of this email.
           */
          user =
            await User.create({
              name,
              email,
              googleId,

              authProvider:
                "google",

              emailVerified: true,
            });
        } else {
          /*
           * Link Google to an existing
           * email/password account.
           */
          let changed = false;

          if (!user.googleId) {
            user.googleId =
              googleId;

            changed = true;
          }

          /*
           * Google proves ownership of the
           * email, so mark it verified.
           */
          if (!user.emailVerified) {
            user.emailVerified =
              true;

            changed = true;
          }

          /*
           * Remove old OTP information
           * because verification is complete.
           */
          if (
            user.emailVerificationTokenHash
          ) {
            user.emailVerificationTokenHash =
              undefined;

            changed = true;
          }

          if (
            user.emailVerificationExpiresAt
          ) {
            user.emailVerificationExpiresAt =
              undefined;

            changed = true;
          }

          if (
            user.emailVerificationSentAt
          ) {
            user.emailVerificationSentAt =
              undefined;

            changed = true;
          }

          if (changed) {
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        console.error(
          "Google strategy error:",
          error
        );

        return done(error);
      }
    }
  )
);

function issueJWTHandler(
  req,
  res
) {
  try {
    if (!req.user) {
      return res.redirect(
        `${clientUrl}` +
          "/login" +
          "?error=google_auth_failed"
      );
    }

    if (
      !process.env.JWT_SECRET
    ) {
      throw new Error(
        "JWT_SECRET is not configured"
      );
    }

    const token = jwt.sign(
      {
        id: req.user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d",
      }
    );

    const callbackData =
      new URLSearchParams({
        token,

        id:
          req.user._id.toString(),

        name:
          req.user.name ||
          "Google User",

        email:
          req.user.email,

        emailVerified: "true",
      });

    return res.redirect(
      `${clientUrl}` +
        "/auth/callback#" +
        callbackData.toString()
    );
  } catch (error) {
    console.error(
      "Google callback error:",
      error
    );

    return res.redirect(
      `${clientUrl}` +
        "/login" +
        "?error=google_auth_failed"
    );
  }
}

module.exports = {
  passport,
  issueJWTHandler,
};