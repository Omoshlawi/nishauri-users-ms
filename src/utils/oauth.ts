import { OAuth2Client } from "google-auth-library";
import { configuration } from ".";
import axios from "axios";
const client = new OAuth2Client(
  configuration.oauth.google_id,
  configuration.oauth.google_secrete,
  "http://localhost:5000/api/auth/callback/google"
);

/**
 * Uses authorization code to get id token then verifies the token to get its payload
 * More automated bt works similar to bellow method validateToken
 * @param code
 * @returns
 */
export const getProfileInfo = async (code: string) => {
  const r = await client.getToken(code);
  const idToken = r.tokens.id_token;
  return await verifyToken(idToken!);
};

export const verifyToken = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: configuration.oauth.google_id,
  });
  const payload = ticket.getPayload();
  return payload;
};

export const getToken = async (code: string) => {
  const { tokens } = await client.getToken(code as any);
  return tokens;
};

/**
 * Work similar to client.verifyToken only that less secure due to unavailability of public client id
 * @param id_token
 * @returns
 */
export const validateToken = async (id_token: string) => {
  try {
    const resp = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
      params: { id_token },
    });
    return resp.data;
  } catch (err) {
    return err;
  }
};
export const getGoogleAuthUrl = () => {
  // Redirect the user to the Google OAuth consent screen
  const authUrl = client.generateAuthUrl({
    scope: ["profile", "email"],
  });
  return authUrl;
};
