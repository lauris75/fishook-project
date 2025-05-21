import React, { useState, useRef, useEffect } from 'react';
import './DropdownMenu.scss';

const DropdownMenu = ({ options, anchorEl, isOpen, setIsOpen }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          anchorEl && !anchorEl.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, setIsOpen]);

  const handleOptionClick = (onClickHandler) => {
    setIsOpen(false);
    if (onClickHandler) {
      onClickHandler();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="dropdown-menu" ref={menuRef}>
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`dropdown-item ${option.danger ? 'danger' : ''} ${option.admin ? 'admin' : ''}`}
              onClick={() => handleOptionClick(option.onClick)}
            >
              {option.icon && <span className="dropdown-item-icon">{option.icon}</span>}
              <span className="dropdown-item-label">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DropdownMenu;