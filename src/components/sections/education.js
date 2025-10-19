import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledEducationSection = styled.section`
  max-width: 700px;
  margin: 0 auto 100px;
  text-align: left;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
    margin-bottom: 30px;
  }

  .education-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 2px;
      padding-left: 0;
      position: relative;
      
      &.expanded {
        margin-bottom: 20px;
      }
    }

    .degree-header {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 3px 0;
      
      .expand-arrow {
        color: var(--green);
        font-size: var(--fz-md);
        transition: transform 0.3s ease;
        display: inline-block;
        
        &.expanded {
          transform: rotate(90deg);
        }
      }
    }

    .degree {
      font-weight: bold;
      color: var(--lightest-slate);
    }
    
    .institution {
      font-family: var(--font-mono);
      margin-top: 10px;
      margin-bottom: 8px;
      
      a {
        ${({ theme }) => theme.mixins.inlineLink};
        color: var(--green);
        
        &:after {
          height: 2px;
        }
      }
    }
    
    .details {
      margin-top: 10px;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
      
      &.expanded {
        max-height: 500px;
        opacity: 1;
      }
      
      &.collapsed {
        margin-top: 0;
      }
    }
    
    .year {
      color: var(--light-slate);
      font-size: var(--fz-xs);
      font-family: var(--font-mono);
    }
    .location {
      color: var(--slate);
      font-size: var(--fz-xs);
      font-family: var(--font-mono);
    }
    .stream {
      color: var(--lightest-slate);
      font-size: var(--fz-sm);
      font-style: italic;
    }
  }
`;

const Education = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    sr.reveal(revealContainer.current, srConfig());
  }, [prefersReducedMotion]);

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <StyledEducationSection id="education" ref={revealContainer}>
      <h2 className="numbered-heading">Education</h2>
      <ul className="education-list">
        <li className={expandedItems[0] ? 'expanded' : ''}>
          <div className="degree-header" onClick={() => toggleExpand(0)}>
            <span className={`expand-arrow ${expandedItems[0] ? 'expanded' : ''}`}>▸</span>
            <span className="degree">10th Grade</span>
          </div>
          <div className={`details ${expandedItems[0] ? 'expanded' : 'collapsed'}`}>
            <div className="institution">
              <a href="https://carmelcmischoolshornur.org/" target="_blank" rel="noopener noreferrer">
                Carmel CMI School, shoranur
              </a>
            </div>
            <div className="location">Shoranur, Kerala, India</div>
            <div className="year">Completed: 2020</div>
          </div>
        </li>
        <li className={expandedItems[1] ? 'expanded' : ''}>
          <div className="degree-header" onClick={() => toggleExpand(1)}>
            <span className={`expand-arrow ${expandedItems[1] ? 'expanded' : ''}`}>▸</span>
            <span className="degree">11th & 12th Grade</span>
          </div>
          <div className={`details ${expandedItems[1] ? 'expanded' : 'collapsed'}`}>
            <div className="institution">
              <a href="https://carmelcmischoolshornur.org/" target="_blank" rel="noopener noreferrer">
                Carmel CMI School, shoranur
              </a>
            </div>
            <div className="stream">Computer-Maths (Science Stream)</div>
            <div className="location">Shoranur, Kerala, India</div>
            <div className="year">Completed: 2022</div>
          </div>
        </li>
        <li className={expandedItems[2] ? 'expanded' : ''}>
          <div className="degree-header" onClick={() => toggleExpand(2)}>
            <span className={`expand-arrow ${expandedItems[2] ? 'expanded' : ''}`}>▸</span>
            <span className="degree">Undergraduate (B.Voc Data Science)</span>
          </div>
          <div className={`details ${expandedItems[2] ? 'expanded' : 'collapsed'}`}>
            <div className="institution">
              <a href="https://stthomas.ac.in/" target="_blank" rel="noopener noreferrer">
                St. Thomas College, Thrissur
              </a>
            </div>
            <div className="location">Thrissur, Kerala, India</div>
            <div className="year">Completed: 2025</div>
          </div>
        </li>
        <li className={expandedItems[3] ? 'expanded' : ''}>
          <div className="degree-header" onClick={() => toggleExpand(3)}>
            <span className={`expand-arrow ${expandedItems[3] ? 'expanded' : ''}`}>▸</span>
            <span className="degree">Postgraduate (MCA, Joint Degree)</span>
          </div>
          <div className={`details ${expandedItems[3] ? 'expanded' : 'collapsed'}`}>
            <div className="institution">
              <a href="https://www.iitp.ac.in/" target="_blank" rel="noopener noreferrer">
                Indian Institute of Technology Patna
              </a>{' '}
              &amp;{' '}
              <a href="https://iiitranchi.ac.in/" target="_blank" rel="noopener noreferrer">
                Indian Institute of Information Technology Ranchi
              </a>
            </div>
            <div className="location">Patna, Bihar & Ranchi, Jharkhand, India</div>
            <div className="year">Expected: 2027</div>
          </div>
        </li>
      </ul>
    </StyledEducationSection>
  );
};

export default Education;
