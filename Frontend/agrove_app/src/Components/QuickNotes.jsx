import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import './QuickNotes.css';

const QuickNotes = () => {
  const [note, setNote] = useState(localStorage.getItem('agri-quick-note') || '');
  const [isSaved, setIsSaved] = useState(true);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    setIsSaved(false);
  };

  const saveNote = () => {
    localStorage.setItem('agri-quick-note', note);
    setIsSaved(true);
  };

  return (
    <div className="notes-container"> {/* This is now the ONLY outer box */}
      <div className="notes-header">
        <div className="header-left">
          <FiEdit3 className="header-icon" />
          <h3>Field Notes</h3>
        </div>
        <div className="header-right">
          {!isSaved && <button className="save-btn" onClick={saveNote}>Save</button>}
          {isSaved && note && <span className="saved-status"><FiCheckCircle size={14} /> SAVED</span>}
        </div>
      </div>
      
      <textarea
        className="notes-textarea"
        placeholder="Type your field tasks here..."
        value={note}
        onChange={handleNoteChange}
      />
    </div>
  );
};

export default QuickNotes;