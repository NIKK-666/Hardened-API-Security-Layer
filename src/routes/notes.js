import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeOwner } from '../middleware/authorizeOwner.js';
import { findNotesByUserId, createNote, deleteNote } from '../utils/store.js';

export const notesRoutes = Router();

// All notes routes require authentication
notesRoutes.use(authenticate);

// Note creation schema: title and body with length limits
const createNoteSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  body: z.string().min(1).max(5000).trim(),
});

// GET /notes - list user's notes
notesRoutes.get('/', (req, res) => {
  const notes = findNotesByUserId(req.user.id);
  res.json({ notes });
});

// POST /notes - create a note
notesRoutes.post('/', validate(createNoteSchema), (req, res) => {
  const { title, body } = req.body;
  const note = createNote(req.user.id, title, body);
  res.status(201).json({ note });
});

// GET /notes/:id - get a specific note (ownership enforced)
notesRoutes.get('/:id', authorizeOwner, (req, res) => {
  res.json({ note: req.note });
});

// DELETE /notes/:id - delete a note (ownership enforced)
notesRoutes.delete('/:id', authorizeOwner, (req, res) => {
  deleteNote(req.note.id);
  res.status(204).send();
});