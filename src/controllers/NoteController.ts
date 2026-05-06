import type { Request, Response } from 'express';
import type { Types } from 'mongoose';

import type { INote } from '@/models/Note';
import Note from '@/models/Note';

type NoteParams = {
  noteId: Types.ObjectId;
};

export const createNote = async (req: Request<object, object, INote>, res: Response) => {
  const { content } = req.body;

  const note = new Note();
  note.content = content;
  note.createdBy = req.user._id;
  note.task = req.task._id;

  req.task.notes.push(note._id);
  try {
    await Promise.allSettled([req.task.save(), note.save()]);
    res.send('Note created successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskNotes = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ task: req.task._id });
    res.json(notes);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNote = async (req: Request<NoteParams>, res: Response) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    const error = new Error('Note not found');
    return res.status(404).json({ error: error.message });
  }

  if (note.createdBy.toString() !== req.user._id.toString()) {
    const error = new Error('Unauthorized action');
    return res.status(401).json({ error: error.message });
  }

  req.task.notes = req.task.notes.filter((note) => note.toString() !== noteId.toString());

  try {
    await Promise.allSettled([req.task.save(), note.deleteOne()]);
    res.send('Note deleted');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
