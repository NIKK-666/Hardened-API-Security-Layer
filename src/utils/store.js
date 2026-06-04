// In-memory data store (replaces a real database for this project)
const users = [];
const notes = [];

export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function createUser(email, passwordHash) {
  const user = { id: crypto.randomUUID(), email, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  return { id: user.id, email: user.email };
}

export function findNotesByUserId(userId) {
  return notes.filter(n => n.userId === userId);
}

export function findNoteById(noteId) {
  return notes.find(n => n.id === noteId);
}

export function createNote(userId, title, body) {
  const note = { id: crypto.randomUUID(), userId, title, body, createdAt: new Date().toISOString() };
  notes.push(note);
  return note;
}

export function deleteNote(noteId) {
  const index = notes.findIndex(n => n.id === noteId);
  if (index !== -1) notes.splice(index, 1);
}