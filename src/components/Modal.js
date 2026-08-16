import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Icon } from '@components/icons'; // Ensure Icon is imported correctly

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  padding: 0;
  overflow: hidden;

  .modal-content {
    background-color: var(--dark-navy);
    padding: 30px;
    border-radius: 10px;
    max-width: 800px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    color: #ffffff;

    h2 {
      color: var(--green);
      margin-bottom: 20px;
      font-size: 2rem;
      padding-right: 40px;
    }

    p {
      color: #ffffff;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .project-links {
      display: flex;
      align-items: center;
      margin-top: 20px;

      a {
        display: inline-flex;
        align-items: center;
        margin-right: 15px;
        text-decoration: none;
        color: var(--green);

        svg {
          width: 18px;
          height: 18px;
          margin-right: 5px;
        }

        &:hover {
          color: #00ff00;
        }
      }
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-top: 20px;
    }

    .close-button {
      position: fixed;
      top: 15px;
      right: 15px;
      background: #e74c3c;
      border: none;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      font-size: 1.5rem;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1010;
      line-height: 1;
      transition: background 0.2s;

      &:hover {
        background: #c0392b;
      }
    }
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    padding: 10px;

    .modal-content {
      width: 100%;
      max-width: 100%;
      max-height: 95vh;
      padding: 20px 15px;
      border-radius: 8px;
      margin: auto 0;

      h2 {
        font-size: 1.3rem;
        padding-right: 40px;
        word-break: break-word;
      }

      p {
        font-size: 0.9rem;
      }

      img {
        max-width: 100%;
      }
    }
  }
`;

const Modal = ({ children, onClose }) => {
  return (
    <StyledModal onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        {children}
      </div>
    </StyledModal>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
