import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { FiEdit3, FiCheckCircle } from 'react-icons/fi';
import './QuickNotes.css';

const QuickNotes = () => {
  const { t } = useTranslation(); // 2. Initialize translation
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
    <div className="notes-container">
      <div className="notes-header">
        <div className="header-left">
          <FiEdit3 className="header-icon" />
          <h3>{t('notes.title')}</h3>
        </div>
        <div className="header-right">
          {!isSaved && (
            <button className="save-btn" onClick={saveNote}>
              {t('edit.save_btn')}
            </button>
          )}
          {isSaved && note && (
            <span className="saved-status">
              <FiCheckCircle size={14} /> {t('notes.saved_status')}
            </span>
          )}
        </div>
      </div>
      
      <textarea
        className="notes-textarea"
        placeholder={t('notes.placeholder')}
        value={note}
        onChange={handleNoteChange}
      />
    </div>
  );
};

export default QuickNotes;