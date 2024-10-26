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
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;

  .modal-content {
    background-color: var(--dark-navy); /* Dark background for better contrast */
    padding: 30px;
    border-radius: 10px;
    max-width: 800px;
    width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    color: #ffffff; /* Default text color to white */

    h2 {
      color: var(--green); /* Green color for titles */
      margin-bottom: 20px;
      font-size: 2rem;
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
        color: var(--green); /* Green color for links */

        svg {
          width: 18px; /* Reduced icon size */
          height: 18px;
          margin-right: 5px;
        }

        &:hover {
          color: #00ff00; /* Lighter green on hover */
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
      position: absolute;
      top: 15px;
      right: 20px;
      background: none;
      border: none;
      font-size: 2rem;
      color: #ffffff;
      cursor: pointer;

      &:hover {
        color: var(--green);
      }
    }
  }

  @media (max-width: 600px) {
    .modal-content {
      padding: 20px;
      h2 {
        font-size: 1.5rem;
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
