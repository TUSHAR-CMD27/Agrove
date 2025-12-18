import React, { useState, useEffect } from 'react';
import { FiEdit3, FiTrash2, FiCheck } from 'react-icons/fi';
import './QuickNotes.css';

const QuickNotes = () => {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Saved');

  useEffect(() => {
    const savedNote = localStorage.getItem('agrove_user_notes');
    if (savedNote) setNote(savedNote);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    setNote(text);
    setStatus('Saving...');
    
    // Debounce save slightly for performance
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      localStorage.setItem('agrove_user_notes', text);
      setStatus('Saved');
    }, 800);
  };

  const clearNotes = () => {
    if(window.confirm("Clear all notes?")) {
      setNote('');
      localStorage.removeItem('agrove_user_notes');
      setStatus('Cleared');
    }
  };

  return (
    <div className="quick-notes-card bento-card">
      <div className="notes-header">
        <div className="header-left">
          <h3><FiEdit3 className="icon-yellow" /> Field Notes</h3>
          <span className={`save-status ${status === 'Saved' ? 'active' : ''}`}>
            {status === 'Saved' && <FiCheck size={10} />} {status}
          </span>
        </div>
        <button onClick={clearNotes} className="clear-btn" title="Clear Notes">
          <FiTrash2 />
        </button>
      </div>
      <textarea
        className="notes-area"
        placeholder="- Buy urea on Monday&#10;- Check pump filter&#10;- Call labor for harvest..."
        value={note}
        onChange={handleChange}
        spellCheck="false"
      ></textarea>
    </div>
  );
};

export default QuickNotes;