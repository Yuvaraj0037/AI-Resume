const crypto = require("crypto");

const TOKEN_EXPIRY_MINUTES = 30;

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function createVerificationToken() {
  const token = crypto
    .randomBytes(32)
    .toString("hex");

  const tokenHash =
    hashToken(token);

  const expiresAt = new Date(
    Date.now() +
      TOKEN_EXPIRY_MINUTES *
        60 *
        1000
  );

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

module.exports = {
  createVerificationToken,
  hashToken,
  TOKEN_EXPIRY_MINUTES,
};