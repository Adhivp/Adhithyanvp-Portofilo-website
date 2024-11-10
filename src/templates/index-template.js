import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Layout,
  Hero,
  About,
  Jobs,
  Featured,
  Projects,
  Contact,
  Events,
} from '@components';
import AdhibotPopup from '@components/AdhiBotPopup';

const StyledMainContainer = styled.main`
  counter-reset: section;
`;

const IndexPage = ({ location }) => {
  const [showChatPopup, setShowChatPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  console.log('Debug: Location:', location);

  return (
    <Layout location={location}>
      <StyledMainContainer className="fillHeight">
        <Hero />
        <About />
        <Jobs />
        <Featured />
        <Projects />
        <Events />
        <Contact />
        <AdhibotPopup show={showChatPopup} onClose={() => setShowChatPopup(false)} />
      </StyledMainContainer>
    </Layout>
  );
};

IndexPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default IndexPage;
