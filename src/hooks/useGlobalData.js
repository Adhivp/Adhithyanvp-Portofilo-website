import { useStaticQuery, graphql } from 'gatsby';

export const useGlobalData = () => {
  const data = useStaticQuery(graphql`
    query GlobalData {
      allStrapiProject {
        nodes {
          title
          description {
            data {
              description
            }
          }
          tech {
            strapi_json_value
          }
        }
      }
      allStrapiJob {
        nodes {
          company
          title
          dateRange
          description {
            data {
              description
            }
          }
        }
      }
      strapiAbout {
        about_content {
          data {
            about_content
          }
        }
        main_skills {
          strapi_json_value
        }
      }
      strapiHero {
        tag_line
        hero_about {
          data {
            hero_about
          }
        }
      }
      allStrapiEvent {
        nodes {
          title
          date
          location
          content {
            data {
              content
            }
          }
        }
      }
    }
  `);

  return {
    projects: data.allStrapiProject.nodes,
    jobs: data.allStrapiJob.nodes,
    about: data.strapiAbout,
    hero: data.strapiHero,
    events: data.allStrapiEvent.nodes
  };
}; 