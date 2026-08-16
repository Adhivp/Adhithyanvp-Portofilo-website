import React from 'react';
import { Layout, Head } from '@components';
import AdhibotInterface from '../components/AdhibotInterface';

const AdhibotPage = ({ location }) => {
  return (
    <Layout location={location}>
      <Head title="Adhibot - AI Assistant" description="Chat with Adhibot, an AI assistant trained on Adhithyan VP's portfolio and expertise." />
      <AdhibotInterface />
    </Layout>
  );
};

export default AdhibotPage; 