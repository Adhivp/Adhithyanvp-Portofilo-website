import { useStaticQuery, graphql } from 'gatsby';

export const useResumeUrl = () => {
  const data = useStaticQuery(graphql`
    query ResumeUrl {
      strapiResume {
        file {
          url
        }
      }
    }
  `);

  return data?.strapiResume?.file?.url || '/resume.pdf';
};
