const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "admin123",
  "letmein",
  "welcome123",
  "iloveyou",
]);

function validatePassword(
  password,
  {
    email = "",
    name = "",
  } = {}
) {
  const errors = [];

  if (typeof password !== "string") {
    return {
      valid: false,
      errors: [
        "Password must be a string",
      ],
    };
  }

  /*
   * This project does not currently use MFA.
   * Use a passphrase of at least 15 characters.
   */
  if (password.length < 15) {
    errors.push(
      "Use at least 15 characters"
    );
  }

  /*
   * bcrypt only processes the first 72 bytes.
   * Do not silently accept anything longer.
   */
  if (
    Buffer.byteLength(
      password,
      "utf8"
    ) > 72
  ) {
    errors.push(
      "Password must not exceed 72 bytes"
    );
  }

  const normalizedPassword =
    password
      .trim()
      .toLowerCase();

  if (
    COMMON_PASSWORDS.has(
      normalizedPassword
    )
  ) {
    errors.push(
      "This password is too common"
    );
  }

  const uniqueCharacters =
    new Set(
      normalizedPassword
    ).size;

  if (uniqueCharacters < 5) {
    errors.push(
      "Password contains too many repeated characters"
    );
  }

  const emailUsername =
    String(email)
      .split("@")[0]
      .trim()
      .toLowerCase();

  if (
    emailUsername.length >= 4 &&
    normalizedPassword.includes(
      emailUsername
    )
  ) {
    errors.push(
      "Password must not contain your email username"
    );
  }

  const normalizedName =
    String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

  if (
    normalizedName.length >= 4 &&
    normalizedPassword
      .replace(/\s+/g, "")
      .includes(normalizedName)
  ) {
    errors.push(
      "Password must not contain your name"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validatePassword,
};