import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useBotContext } from '../context/BotContext';
import { getChatResponse } from '../services/geminiService';
import IconBot from './icons/bot';
import TypingAnimation from './TypingAnimation';
import ReactMarkdown from 'react-markdown';

const StyledChatContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  padding: var(--nav-height) 2rem;
`;

const StyledChatHeader = styled.div`
  ${({ theme }) => theme.mixins.flexBetween};
  padding: 1.5rem;
  background-color: var(--light-navy);
  border-radius: 10px 10px 0 0;
  border: 1px solid var(--green);
  border-bottom: none;

  h2 {
    color: var(--green);
    font-size: var(--fz-xxl);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      width: 30px;
      height: 30px;
    }
  }
`;

const StyledChatBody = styled.div`
  height: 60vh;
  background-color: var(--navy);
  border: 1px solid var(--lightest-navy);
  padding: 1.5rem;
  overflow-y: auto;

  .message {
    margin: 1.5rem 0;
    max-width: 80%;
    
    &.user {
      margin-left: auto;
      .bubble {
        background-color: var(--green);
        color: var(--navy);
        border-radius: 15px 15px 0 15px;
        font-size: var(--fz-lg);
      }
    }
    
    &.bot {
      margin-right: auto;
      .bubble {
        background-color: var(--light-navy);
        color: var(--white);
        border-radius: 15px 15px 15px 0;
        font-size: var(--fz-lg);
      }
    }

    .bubble {
      padding: 1.2rem;
      line-height: 1.6;
    }
  }
`;

const StyledInputArea = styled.div`
  ${({ theme }) => theme.mixins.flexBetween};
  padding: 1.5rem;
  background-color: var(--light-navy);
  border-radius: 0 0 10px 10px;
  border: 1px solid var(--green);
  border-top: none;

  input {
    flex: 1;
    background-color: var(--navy);
    border: 1px solid var(--lightest-navy);
    border-radius: 5px;
    padding: 0.75rem;
    color: var(--white);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    margin-right: 0.5rem;

    &:focus {
      outline: none;
      border-color: var(--green);
    }
  }

  button {
    ${({ theme }) => theme.mixins.smallButton};
    font-size: var(--fz-md);
    padding: 0.75rem 1rem;
    white-space: nowrap;
    min-width: fit-content;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;

    input {
      padding: 0.5rem;
      font-size: var(--fz-sm);
      margin-right: 0.25rem;
    }

    button {
      padding: 0.5rem;
      font-size: var(--fz-sm);
    }
  }

  @media (max-width: 350px) {
    padding: 0.5rem;

    input {
      padding: 0.4rem;
      font-size: var(--fz-xs);
    }

    button {
      padding: 0.4rem;
      font-size: var(--fz-xs);
    }
  }
`;

const StyledWarningBanner = styled.div`
  background-color: var(--navy);
  border: 1px solid var(--orange);
  color: var(--orange);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: var(--fz-sm);
  text-align: center;
`;

const StyledMarkdown = styled.div`
  * {
    color: inherit;
  }
  
  p {
    margin: 0.5rem 0;
  }
  
  code {
    background-color: var(--navy);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 85%;
  }
  
  pre {
    background-color: var(--navy);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
`;

const AdhibotInterface = () => {
  const { botContext } = useBotContext();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm Adhibot, Adhithyan's AI assistant. How can I help you today?",
      isTyping: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: inputText, isTyping: false }]);
    setIsLoading(true);

    try {
      // Add loading message with typing animation
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Thinking...', 
        isTyping: true,
        animate: true 
      }]);
      
      // Get response from Gemini
      const response = await getChatResponse(inputText, botContext);
      
      // Update with actual response without animation
      setMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'bot', text: response, isTyping: false }
      ]);
    } catch (error) {
      console.error('Chat Interface Error:', {
        message: error.message,
        type: error.name,
        stack: error.stack
      });
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'Bot is not properly configured. Please contact the administrator.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Service is temporarily unavailable. Please try again later.';
      }
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'bot', text: errorMessage, isTyping: false }
      ]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StyledChatContainer>
      <StyledWarningBanner>
        ⚠️ Adhibot is currently in beta. Responses may occasionally be inaccurate or contain hallucinations.
      </StyledWarningBanner>
      
      <StyledChatHeader>
        <h2>
          <IconBot /> Chat with Adhibot
        </h2>
      </StyledChatHeader>
      
      <StyledChatBody>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="bubble">
              {message.isTyping ? (
                <TypingAnimation 
                  text={message.text}
                  onComplete={() => {
                    if (message.text === 'Thinking...') {
                      return;
                    }
                    setMessages(prev => prev.map((msg, i) => 
                      i === index ? { ...msg, isTyping: false } : msg
                    ));
                  }}
                />
              ) : (
                <StyledMarkdown>
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </StyledMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </StyledChatBody>

      <StyledInputArea>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          Send
        </button>
      </StyledInputArea>
    </StyledChatContainer>
  );
};

export default AdhibotInterface; 