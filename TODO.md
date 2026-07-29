# TODO - Server error correction (@server)

- [ ] Update `server/middleware/uploadMiddleware.js` to auto-create `uploads/` directory if missing.
- [ ] Harden `server/middleware/authMiddleware.js` to validate decoded JWT payload and return clear 401 when `id` missing.
- [ ] Harden `server/controllers/resumeController.js` to validate `req.user.id` and add clearer 400/401 errors.
- [ ] Improve `server/utils/parseGemini.js` to robustly extract JSON from Gemini text.
- [ ] Run server and test resume upload flow end-to-end.

