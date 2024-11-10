import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { CSSTransition } from 'react-transition-group';
import IconBot from '@components/icons/bot';
import IconMinimize from '@components/icons/minimize';

const StyledPopup = styled.div`
  position: fixed;
  bottom: ${props => (props.isMinimized ? '2rem' : '6rem')};
  right: 2rem;
  background-color: var(--light-navy);
  border-radius: 10px;
  padding: ${props => (props.isMinimized ? '1rem' : '1.5rem')};
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
  z-index: 999;
  max-width: ${props => (props.isMinimized ? '60px' : '300px')};
  border: 1px solid var(--green);
  transition: all 0.3s ease;

  @media (min-width: 768px) {
    bottom: ${props => (props.isMinimized ? '2rem' : '12rem')};
    right: 6rem;
  }

  .popup-content {
    display: ${props => (props.isMinimized ? 'none' : 'flex')};
    flex-direction: column;
    gap: 1rem;
    opacity: 1;
    height: auto;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  h4 {
    color: var(--green);
    margin: 0;
    font-size: var(--fz-md);
  }

  p {
    color: var(--slate);
    font-size: var(--fz-sm);
    margin: 0;
  }

  .chat-button {
    ${({ theme }) => theme.mixins.smallButton};
    width: fit-content;
    border: 2px solid var(--green);
    border-radius: 4px;
    padding: 0.75rem 1rem;
    position: relative;
    color: var(--green);
    z-index: 1;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

    &:hover {
      background-color: var(--green);
      color: var(--light-navy);
      border-color: var(--green);
      outline: none;
      box-shadow: none;
      z-index: 2;
    }

    &::before,
    &::after {
      display: none;
    }
  }

  .control-buttons {
    position: absolute;
    top: ${props => (props.isMinimized ? '50%' : '1rem')};
    right: ${props => (props.isMinimized ? '50%' : '1rem')};
    transform: ${props => (props.isMinimized ? 'translate(50%, -50%)' : 'none')};
    display: flex;
    gap: 0.5rem;
    width: ${props => (props.isMinimized ? 'auto' : 'auto')};

    button {
      background: none;
      border: none;
      color: var(--slate);
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.3s ease;

      &:hover {
        color: var(--green);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .bot-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: var(--green);
  }
`;

const AdhibotPopup = ({ show, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <CSSTransition in={show} timeout={300} classNames="fadeup" unmountOnExit>
      <StyledPopup isMinimized={isMinimized}>
        <div className="control-buttons">
          <button onClick={toggleMinimize} aria-label={isMinimized ? 'Expand' : 'Minimize'}>
            {isMinimized ? <IconBot className="bot-icon" /> : <IconMinimize />}
          </button>
          {!isMinimized && (
            <button onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </div>

        {!isMinimized && (
          <div className="popup-content">
            <h4>Chat with Adhibot</h4>
            <p>
              Have questions? I'm an AI assistant ready to help you learn more about Adhithyan's work,
              experiences and projects!
            </p>
            <Link to="/adhibot" className="chat-button">
              Start Chat
            </Link>
          </div>
        )}
      </StyledPopup>
    </CSSTransition>
  );
};

export default AdhibotPopup;
