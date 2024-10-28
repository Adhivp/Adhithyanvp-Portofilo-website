import React, { useState, useEffect, useRef } from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

const StyledProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .archive-link {
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    &:after {
      bottom: 0.1em;
    }
  }

  .projects-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }

  .divider {
    width: 100%;
    height: 1px;
    background-color: var(--lightest-navy);
    margin: 50px 0 30px;
  }
    
  &:before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 3px;
    width: 50px;
    background-color: var(--green);
    top: -1px;
  }
`;

const StyledProject = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .project-inner {
        transform: translateY(-7px);
      }
    }
  }

  a {
    position: relative;
    z-index: 1;
  }

  .project-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    overflow: auto;
  }

  .project-top {
    ${({ theme }) => theme.mixins.flexBetween};
    margin-bottom: 35px;
    width: 100%;

    .folder {
      color: var(--green);
      svg {
        width: 40px;
        height: 40px;
      }
    }
  }

  .project-links {
    position: absolute;
    top: 1.75rem;
    right: 1.75rem;
    display: flex;
    align-items: center;
    color: var(--light-slate);

    a {
      ${({ theme }) => theme.mixins.flexCenter};
      padding: 5px 7px;

      &.external {
        svg {
          width: 22px;
          height: 22px;
          margin-top: -4px;
        }
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .project-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);

    a {
      position: static;

      &:before {
        content: '';
        display: block;
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }

  .project-description {
    color: var(--light-slate);
    font-size: 17px;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .project-tech-list {
    display: flex;
    align-items: flex-end;
    flex-grow: 1;
    flex-wrap: wrap;
    padding: 0;
    margin: 20px 0 0 0;
    list-style: none;

    li {
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;

      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
`;

const Projects = () => {
  const data = useStaticQuery(graphql`
    query AllProjectsQuery {
      allStrapiProject(
        filter: { showInProjects: { eq: true }, featured: { ne: true } }
        sort: {date: DESC}
      ) {
        nodes {
          id
          title
          external
          devfolio
          github
          tech {
            strapi_json_value
          }
          description {
            data {
              description
            }
          }
        }
      }
    }
  `);

  const projects = data.allStrapiProject.nodes.map(project => ({
    ...project,
    description: project.description?.data?.description || '',
    tech: project.tech?.strapi_json_value || [],
  }));

  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealArchiveLink = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealArchiveLink.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, [prefersReducedMotion]);

  const GRID_LIMIT = 6;
  const firstSix = projects.slice(0, GRID_LIMIT);
  const projectsToShow = showMore ? projects : firstSix;

  const projectInner = project => {
    const { title, tech, github, external, devfolio, description } = project;

    return (
      <div className="project-inner">
        <div className="project-links">
          {github && (
            <a href={github.startsWith('https') ? github : `https://${github}`} aria-label="GitHub Link" target="_blank" rel="noopener noreferrer">
              <Icon name="GitHub" />
            </a>
          )}
          {external && (
            <a href={external.startsWith('https') ? external : `https://${external}`} aria-label="External Link" className="external" target="_blank" rel="noopener noreferrer">
              <Icon name="External" />
            </a>
          )}
          {devfolio && (
            <a href={devfolio.startsWith('https') ? devfolio : `https://${devfolio}`} aria-label="Devfolio Link" className="devfolio" target="_blank" rel="noopener noreferrer">
              <Icon name="Devfolio" />
            </a>
          )}
        </div>

        <header>
          <div className="project-top">
            <div className="folder">
              <Icon name="Folder" />
            </div>
          </div>
          <h3 className="project-title">
            {external ? (
              <a href={external.startsWith('https') ? external : `https://${external}`} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            ) : (
              <span>{title}</span>
            )}
          </h3>

          <div className="project-description" dangerouslySetInnerHTML={{ __html: description }} />
        </header>
        <footer>
          {tech?.strapi_json_value ? (
            <ul className="project-tech-list">
              {tech.strapi_json_value.map((techItem, i) => (
                <li key={i}>
                  <span>{techItem}</span>
                </li>
              ))}
            </ul>
          ) : tech ? (
            <ul className="project-tech-list">
              {tech.map((techItem, i) => (
                <li key={i}>
                  <span>{techItem}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </footer>
      </div>
    );
  };

  return (
    <StyledProjectsSection>
      <h2 ref={revealTitle}>Other Noteworthy Projects</h2>

      <Link className="inline-link archive-link" to="/projects-archive" ref={revealArchiveLink}>
        View Full Projects Archive
      </Link>

      {projects.length > 0 && (
        <ul className="projects-grid">
          {prefersReducedMotion ? (
            <>
              {projectsToShow &&
                projectsToShow.map((project, i) => (
                  <StyledProject key={project.id}>{projectInner(project)}</StyledProject>
                ))}
            </>
          ) : (
            <TransitionGroup component={null}>
              {projectsToShow &&
                projectsToShow.map((project, i) => (
                  <CSSTransition
                    key={project.id}
                    classNames="fadeup"
                    timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                    exit={false}>
                    <StyledProject
                      ref={el => (revealProjects.current[i] = el)}
                      style={{
                        transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                      }}>
                      {projectInner(project)}
                    </StyledProject>
                  </CSSTransition>
                ))}
            </TransitionGroup>
          )}
        </ul>
      )}
      {projects.length > GRID_LIMIT && (
        <button className="more-button" onClick={() => setShowMore(!showMore)}>
          Show {showMore ? 'Less' : 'More'}
        </button>
      )}
      <div className="divider" />
      <Link
        className="inline-link archive-link"
        to="/projects-archive"
        ref={revealArchiveLink}
      >
        View Full Projects Archive
      </Link>
    </StyledProjectsSection>
  );
};

export default Projects;
