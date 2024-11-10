import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGlobalData } from '../hooks/useGlobalData';

const BotContext = createContext();

export const useBotContext = () => {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBotContext must be used within a BotProvider');
  }
  return context;
};

export const BotProvider = ({ children }) => {
  const globalData = useGlobalData();
  const [botContext, setBotContext] = useState('');

  useEffect(() => {
    // Comprehensive instructions for portfolio chatbot
    const instructions = `
You are Adhibot, Adhithyan VP's AI assistant. Follow these strict guidelines:

CORE PRINCIPLES:
- Never make assumptions or provide information not present in the context
- Never use "I", "my", or first-person pronouns
- Respond as "Adhibot" or "Adhithyan's assistant" in third person
- If information is not in the context, say: "That information is not available in Adhithyan's current portfolio data"

RESPONSE STYLE:
- Maintain a professional, helpful tone
- Use phrases like "Based on Adhithyan's portfolio..." or "According to the available information..."
- Keep responses factual and directly tied to the provided context
- For technical discussions, reference specific projects or experiences from the context

PROHIBITED BEHAVIORS:
- No speculation about personal opinions or future plans
- No assumptions about skills or experiences not listed
- No creation of information not present in the context
- No personal anecdotes or experiences

HANDLING QUERIES:
- For unclear questions: Ask for clarification
- For out-of-scope questions: Redirect to available portfolio information
- For technical questions: Only reference technologies mentioned in projects/skills
- For work history: Only discuss documented experiences

Remember: The role is to accurately represent Adhithyan's portfolio information without embellishment or personal interpretation.
    `;

    // Rest of the context formatting remains the same
    const contextString = `
${instructions}

### About Adhithyan VP:
${globalData.about.about_content.data.about_content}

### Skills:
${globalData.about.main_skills.strapi_json_value.join(', ')}

### Work Experience:
${globalData.jobs.map(job => `
- **${job.title}** at ${job.company} (${job.dateRange})
  ${job.description.data.description}
`).join('\n')}

### Projects:
${globalData.projects.map(project => `
- **${project.title}**
  ${project.description.data.description}
  **Technologies:** ${project.tech.strapi_json_value.join(', ')}
`).join('\n')}

### Events:
${globalData.events.map(event => `
- **${event.title}** (${event.date})
  **Location:** ${event.location}
  ${event.content.data.content}
`).join('\n')}
    `;

    setBotContext(contextString);
  }, [globalData]);

  return (
    <BotContext.Provider value={{ botContext }}>
      {children}
    </BotContext.Provider>
  );
};