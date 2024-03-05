import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  "",
  "",
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


  console.log(tokens);
  // Now you can use 'tokens.id_token' or 'tokens.access_token' for user authentication
  // Redirect or respond as needed
  res.send("Authentication successful");
};
