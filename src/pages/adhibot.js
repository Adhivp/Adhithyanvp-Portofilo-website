import React from 'react';
import { Layout } from '@components';
import AdhibotInterface from '../components/AdhibotInterface';

const AdhibotPage = ({ location }) => {
  return (
    <Layout location={location}>
      <AdhibotInterface />
    </Layout>
  );
};

export default AdhibotPage; 