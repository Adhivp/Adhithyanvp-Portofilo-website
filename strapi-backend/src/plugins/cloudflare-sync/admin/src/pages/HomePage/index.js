import React, { useState } from 'react';
import {
  Layout,
  HeaderLayout,
  ContentLayout,
  Button,
  Box,
  Typography,
  Alert,
  Loader,
} from '@strapi/design-system';
import { request } from '@strapi/helper-plugin';
import { Cloud, Refresh } from '@strapi/icons';

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await request('/cloudflare-sync/trigger', {
        method: 'POST',
      });

      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to trigger sync');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <HeaderLayout
        title="Cloudflare Sync"
        subtitle="Manually sync content to Cloudflare and rebuild website"
        as="h2"
      />
      <ContentLayout>
        <Box padding={8} background="neutral0" hasRadius shadow="filterShadow">
          <Box paddingBottom={4}>
            <Typography variant="beta">Manual Sync Controls</Typography>
            <Box paddingTop={2}>
              <Typography variant="omega" textColor="neutral600">
                Click the button below to manually trigger:
              </Typography>
              <ul>
                <li>
                  <Typography variant="omega" textColor="neutral600">
                    Re-vectorize all projects, events, and jobs
                  </Typography>
                </li>
                <li>
                  <Typography variant="omega" textColor="neutral600">
                    Update Cloudflare Vectorize database
                  </Typography>
                </li>
                <li>
                  <Typography variant="omega" textColor="neutral600">
                    Trigger Cloudflare Pages rebuild
                  </Typography>
                </li>
              </ul>
            </Box>
          </Box>

          <Box paddingTop={4} paddingBottom={4}>
            <Button
              startIcon={loading ? <Loader small /> : <Refresh />}
              onClick={handleSync}
              disabled={loading}
              size="L"
            >
              {loading ? 'Syncing...' : 'Sync to Cloudflare'}
            </Button>
          </Box>

          {result && (
            <Box paddingTop={4}>
              <Alert
                closeLabel="Close"
                title="Success"
                variant="success"
                onClose={() => setResult(null)}
              >
                <Typography>
                  Sync completed successfully!
                  {result.vectorCount && (
                    <> Vectorized {result.vectorCount} items.</>
                  )}
                  {result.buildTriggered && <> Website rebuild triggered.</>}
                </Typography>
              </Alert>
            </Box>
          )}

          {error && (
            <Box paddingTop={4}>
              <Alert
                closeLabel="Close"
                title="Error"
                variant="danger"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Box>
          )}

          <Box paddingTop={6} borderTop="neutral200">
            <Typography variant="omega" textColor="neutral600">
              <strong>Note:</strong> This process takes approximately 30-60 seconds.
              The website rebuild will take an additional 2-3 minutes.
            </Typography>
          </Box>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default HomePage;
