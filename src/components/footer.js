import React from 'react';
import styled from 'styled-components';
import { Icon } from '@components/icons';
import { socialMedia } from '@config';

const StyledFooter = styled.footer`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  height: auto;
  min-height: 70px;
  padding: 15px;
  text-align: center;
`;

const StyledSocialLinks = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    max-width: 270px;
    margin: 0 auto 10px;
    color: var(--light-slate);
  }

  ul {
    ${({ theme }) => theme.mixins.flexBetween};
    padding: 0;
    margin: 0;
    list-style: none;

    a {
      padding: 10px;
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const StyledCredit = styled.div`
  color: var(--light-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  line-height: 1.5;

  a {
    padding: 5px;
    text-decoration: none;
    color: var(--light-slate);
    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--green);
    }
  }

  .highlight {
    color: var(--green);
  }

  .credit-line {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    
    svg {
      width: 12px;
      height: 12px;
      margin-right: 5px;
    }
  }

  .adhithyan-note {
    font-style: italic;
    margin-top: 10px;
    color: var(--slate);
  }
`;

const Footer = () => {
  return (
    <StyledFooter>
      <StyledSocialLinks>
        <ul>
          {socialMedia &&
            socialMedia.map(({ name, url }, i) => (
              <li key={i}>
                <a href={url} aria-label={name}>
                  <Icon name={name} />
                </a>
              </li>
            ))}
        </ul>
      </StyledSocialLinks>

      <StyledCredit tabIndex="-1">
        <div className="credit-line">
          <a href="https://github.com/Adhivp/Adhithyanvp-Portofilo-website" target="_blank" rel="noopener noreferrer">
            <Icon name="GitHub" />
            <span>Creatively enhanced and personalized by <span className="highlight">Adhithyan VP</span></span>
          </a>
        </div>
        <div className="credit-line">
          <a href="https://github.com/bchiang7/v4" target="_blank" rel="noopener noreferrer">
            <Icon name="GitHub" />
            <span>Originally designed by <span className="highlight">Brittany Chiang</span></span>
          </a>
        </div>
        <div className="adhithyan-note">
          "Transforming ideas into digital reality with passion and precision." - Adhithyan VP
        </div>
      </StyledCredit>
    </StyledFooter>
  );
};

export default Footer;
