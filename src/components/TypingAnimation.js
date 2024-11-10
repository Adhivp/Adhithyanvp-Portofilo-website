import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledTypingDots = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding-left: 4px;

  .dot {
    width: 4px;
    height: 4px;
    background-color: var(--green);
    border-radius: 50%;
    animation: bounce 1.4s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-4px); }
  }
`;

const TypingAnimation = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text === 'Thinking...') {
      // For loading state, show text immediately with dots animation
      setDisplayedText('Thinking');
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete && onComplete();
    }
  }, [currentIndex, text, isComplete, onComplete]);

  if (text === 'Thinking...') {
    return (
      <>
        {displayedText}
        <StyledTypingDots>
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </StyledTypingDots>
      </>
    );
  }

  return displayedText;
};

export default TypingAnimation; 