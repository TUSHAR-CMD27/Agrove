import React, { useState, useEffect } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import './QuickNotes.css';

const QuickNotes = () => {
  const [note, setNote] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const savedNote = localStorage.getItem('agrove_user_notes');
    if (savedNote) setNote(savedNote);
  }, []);

  // Save on change
  const handleChange = (e) => {
    setNote(e.target.value);
    localStorage.setItem('agrove_user_notes', e.target.value);
  };

  return (
    <div className="quick-notes-card">
      <div className="notes-header">
        <h3><FiEdit3 /> Field Notes</h3>
        <span className="save-status">Auto-saved</span>
      </div>
      <textarea
        className="notes-area"
        placeholder="Write reminders here... e.g., Buy fertilizer on Tuesday"
        value={note}
        onChange={handleChange}
      ></textarea>
    </div>
  );
};

export default QuickNotes;