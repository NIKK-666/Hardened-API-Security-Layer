import { findNoteById } from '../utils/store.js';

export function authorizeOwner(req, res, next) {
  const noteId = req.params.id;
  const note = findNoteById(noteId);

  // Return 404 for both "not found" and "not yours" to prevent information leakage
  if (!note || note.userId !== req.user.id) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  req.note = note;
  next();
}