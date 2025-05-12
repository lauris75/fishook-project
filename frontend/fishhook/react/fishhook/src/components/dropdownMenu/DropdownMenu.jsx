import React, { useState, useRef, useEffect } from 'react';
import './DropdownMenu.scss';

const DropdownMenu = ({ options, anchorEl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (onClickHandler) => {
    setIsOpen(false);
    if (onClickHandler) {
      onClickHandler();
    }
  };

  // Close menu when clicking outside
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
  }, [anchorEl]);

  return (
    <div className="dropdown-container">
      <div className="dropdown-toggle" onClick={toggleMenu} ref={anchorEl}>
        {/* This is just a container for the toggle button */}
      </div>
      {isOpen && (
        <div className="dropdown-menu" ref={menuRef}>
          {options.map((option, index) => (
            <div 
              key={index} 
              className="dropdown-item"
              onClick={() => handleOptionClick(option.onClick)}
            >
              {option.icon && <span className="dropdown-item-icon">{option.icon}</span>}
              <span className="dropdown-item-label">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;