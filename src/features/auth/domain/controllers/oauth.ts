/*
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "1018061619557-vautqdqti2nj0u2vifoi2h504fcrhjog.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //     return cb(err, user);
      //   });
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);

      return cb(null, undefined);
    }
  )
);

export const googleAuth = passport.authenticate("google", {
  scope: ["profile"],
});
export const googleAuthenticateMidleware = passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login",
});
*/

import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  "1018061619557-vautqdqti2nj0u2vifoi2h504fcrhjog.apps.googleusercontent.com",
  "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",
  "http://localhost:5000/auth/google/callback/"
);

export const oauth = (req: Request, res: Response, next: NextFunction) => {
  // Redirect the user to the Google OAuth consent screen

  const authUrl = client.generateAuthUrl({
    scope: ["profile", "email"],
  });
  res.redirect(authUrl);
};

export const oauthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code } = req.query;
  // Exchange the authorization code for an access token
  const { tokens } = await client.getToken(code as any);
  /*
     token
    {
    access_token: 'ya29.a0AfB_byD5GmrQO_GeDOL2dF45gv8ksVR-y6EUpgEHeDknqBQdcdbMrbs8Oq-RlZG_vLCm67nHelIgLhAlGeOj_VJchYhcAx_ZevcoQMd0DnkyBcOwuNLcvjGOvdx1HAP9Gi80Y_YnLjX0lXAqHr7XWwj13ZV43NYdbJvNaCgYKAbISARMSFQHGX2Mib0foQKjUMBO8Vx_SIizijA0171',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
    token_type: 'Bearer',
    id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkxNDEzY2Y0ZmEwY2I5MmEzYzNmNWEwNTQ1MDkxMzJjNDc2NjA5MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMDE4MDYxNjE5NTU3LXZhdXRxZHF0aTJuajB1MnZpZm9pMmg1MDRmY3Joam9nLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTAxODA2MTYxOTU1Ny12YXV0cWRxdGkybmowdTJ2aWZvaTJoNTA0ZmNyaGpvZy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwODc1Mzk0Mzg3MDIzNzUwMTEwMCIsImVtYWlsIjoicGh5c2hhbWVybjFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiIwN09taHd5d0RHN3ZWMFE1TTdmMjFRIiwibmFtZSI6ImZpc2hlciBtYW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSVFIVzZsODN5a2hNMHJldEVBdUYxdUo5RXBZa2FhYTdMeEc3ZUdCelQtPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImZpc2hlciIsImZhbWlseV9uYW1lIjoibWFuIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE3MDQ4Mzk5OTgsImV4cCI6MTcwNDg0MzU5OH0.b-pUZlTbU7hXcG1QgIUXFIOPIcMHptnIE8k1pw9ZIWjtVX8MsLdmvHdB4o8WM0s-S3DynPyheyVV06ACMkyH7EIwf39mRv_huB_fWzi7GQ8QrSuKcFT_afH-R0Zu-QU7B7RV2_A1SQPqBFsS_H0IJTXwFX57yzFZPXnTOwqt6qc8ChBmx9m4hLrrJYZDPt827H_eAwTDzC2hPVEss4Vz-oOWF1ccH3_qMoA4Ckn97cycMJoSpq1HA79G2_dlrndQ3A13xLSBcJn8m2spFePgBxg2F26OLpflkBFZlRU5aizCRltsmnKYXEgS_pQ7cucWIVvod6Pc6zSuu562mE1uAQ',
    expiry_date: 1704843599753
    }
 */

  console.log(tokens);
  // Now you can use 'tokens.id_token' or 'tokens.access_token' for user authentication
  // Redirect or respond as needed
  res.send("Authentication successful");
};
