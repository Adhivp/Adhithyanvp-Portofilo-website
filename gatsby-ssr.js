/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from 'react';

export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: 'en' });
};

export const onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents();

  // Check if title exists
  const hasTitle = headComponents.some(
    (el) =>
      el.type === 'title' ||
      (el.props && el.props['data-react-helmet'] === 'true' && el.type === 'title')
  );

  // Check if meta description exists
  const hasDescription = headComponents.some(
    (el) =>
      el.props &&
      el.props.name === 'description' &&
      el.props['data-react-helmet'] === 'true'
  );

  // Add fallback title and description if they don't exist
  const fallbackComponents = [];

  if (!hasTitle) {
    fallbackComponents.push(
      <title key="fallback-title">Adhithyan VP - AI Engineer & Software Engineer</title>
    );
  }

  if (!hasDescription) {
    fallbackComponents.push(
      <meta
        key="fallback-description"
        name="description"
        content="Adhithyan VP is an AI engineer and software engineer who builds intelligent web apps with AI and data, focusing on crafting intuitive, AI-powered products that solve real-world problems."
      />
    );
  }

  if (fallbackComponents.length > 0) {
    replaceHeadComponents([...fallbackComponents, ...headComponents]);
  }
};