import React from 'react';

const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const messageClass = type === 'error' ? 'message-box error' : 'message-box success';

  return (
    <div className="message-box-overlay">
      <div className={messageClass}>
        <p className="message-text">{message}</p>
        <button onClick={onClose} className="message-box-close-button">
          Fechar
        </button>
      </div>
    </div>
  );
};

export default MessageBox;