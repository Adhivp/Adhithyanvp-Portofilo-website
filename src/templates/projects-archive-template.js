import React, { useState, useEffect, useRef } from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import { Helmet } from 'react-helmet';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout } from '@components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Modal, Pagination } from '@components';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

const StyledTableContainer = styled.div`
  margin: 100px -20px;

  @media (max-width: 768px) {
    margin: 50px -10px;
  }

  .image-column {
    width: 50px; /* Adjust size as needed */
    height: 50px;
    overflow: hidden;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;

    .hide-on-mobile {
      @media (max-width: 768px) {
        display: none;
      }
    }

    tbody tr {
      position: relative;
      cursor: pointer; /* Indicate clickable rows */

      &:hover,
      &:focus {
        background-color: var(--light-navy);
      }

      &:hover .popup,
      &:focus .popup {
        display: block;
      }
    }

    th,
    td {
      padding: 10px;
      text-align: left;

      &:first-child {
        padding-left: 20px;

        @media (max-width: 768px) {
          padding-left: 10px;
        }
      }
      &:last-child {
        padding-right: 20px;

        @media (max-width: 768px) {
          padding-right: 10px;
        }
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    tr {
      cursor: default;

      td:first-child {
        border-top-left-radius: var(--border-radius);
        border-bottom-left-radius: var(--border-radius);
      }
      td:last-child {
        border-top-right-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
      }
    }

    td {
      &.year {
        padding-right: 20px;

        @media (max-width: 768px) {
          padding-right: 10px;
          font-size: var(--fz-sm);
        }
      }

      &.title {
        padding-top: 15px;
        padding-right: 20px;
        color: var(--lightest-slate);
        font-size: var(--fz-xl);
        font-weight: 600;
        line-height: 1.25;

        a {
          ${({ theme }) => theme.mixins.inlineLink};
          color: var(--green);
        }
      }

      &.company {
        font-size: var(--fz-lg);
        white-space: nowrap;
      }

      &.tech {
        font-size: var(--fz-xxs);
        font-family: var(--font-mono);
        line-height: 1.5;

        .separator {
          margin: 0 5px;
        }

        span {
          display: inline-block;
        }
      }

      &.links {
        min-width: 100px;

        div {
          display: flex;
          align-items: center;

          a {
            ${({ theme }) => theme.mixins.flexCenter};
            flex-shrink: 0;
          }

          a + a {
            margin-left: 10px;
          }
        }
      }

      &.image-column {
        /* Ensure the image fits well within the cell */
        display: flex;
        justify-content: center;
        align-items: center;

        img.thumbnail {
          border-radius: var(--border-radius);
        }
      }
    }
  }

  .pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    span {
      font-size: 0.9rem;
      color: var(--slate);
    }

    label {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: var(--slate);

      select {
        margin-left: 5px;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid #ccc;
      }
    }
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  max-width: 90%;
  max-height: 90%;
  position: relative;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: var(--border-radius);
  }

  /* Optional: Close button */
  .close-button {
    position: absolute;
    top: -10px;
    right: -10px;
    background: var(--green);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
      color: white;
    }
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between; // Align title to left and icons to right
  align-items: center; // Center items vertically
  margin-bottom: 15px; // Slightly reduced margin

  h2 {
    margin: 0;
    font-size: 2.5rem; // Increased title size
    display: flex; // Make title and icons inline
    align-items: center; // Center vertically within h2
    color: var(--slate); // Changed from green to slate or your desired color
  }

  .title-icons {
    display: flex;
    gap: 10px;
    margin-left: 15px;

    a {
      text-decoration: none;

      svg {
        width: 20px;
        height: 20px;
        color: white;
        cursor: pointer;
        transition: transform 0.2s, color 0.2s;

        &:hover {
          color: var(--green);
        }
      }
    }
  }
`;

const StyledProjectInfo = styled.div`
  margin-bottom: 20px;

  p {
    margin: 5px 0;
    font-size: 1.2rem;
    line-height: 1.5;
  }
`;

const StyledProjectDescription = styled.div`
  a {
    ${({ theme }) => theme.mixins.inlineLink};
    color: var(--green);
    text-decoration: none;
  }
`;

const ArchivePage = ({ location }) => {
  const data = useStaticQuery(graphql`
    query {
      allStrapiProject(sort: { date: DESC }) {
        nodes {
          id
          date
          github
          external
          devfolio
          title
          tech {
            strapi_json_value
          }
          placeBuiltFor
          cover {
            localFile {
              childImageSharp {
                gatsbyImageData(width: 200, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
              }
            }
            url
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
    tech: Array.isArray(project.tech) 
      ? project.tech.map(t => t.strapi_json_value)
      : project.tech?.strapi_json_value 
        ? [project.tech.strapi_json_value]
        : []
  }));

  const revealTitle = useRef(null);
  const revealTable = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [imagePopupUrl, setImagePopupUrl] = useState('');

  const handleImageClick = (url, isModal = false) => {
    if (isModal) {
      setImagePopupUrl(url);
      setIsImagePopupOpen(true);
    } else {
      setPopupImageUrl(url);
      setIsPopupOpen(true);
    }
  };

  const handleCloseImagePopup = () => {
    setIsPopupOpen(false);
    setPopupImageUrl('');
    setIsImagePopupOpen(false);
    setImagePopupUrl('');
  };

  const handleRowClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealTable.current, srConfig(200, 0));
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 10)));
  }, [prefersReducedMotion]);

  const pageCount = Math.ceil(projects.length / itemsPerPage);
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  const offset = currentPage * itemsPerPage;
  const currentProjects = projects.slice(offset, offset + itemsPerPage);

  return (
    <Layout location={location}>
      <Helmet title="Archive" />

      <main>
        <header ref={revealTitle}>
          <h1 className="big-heading">Project Archive</h1>
          <p className="subtitle">A big list of things I've worked on</p>
        </header>

        <StyledTableContainer ref={revealTable} isBlurred={isPopupOpen}>
          <div className="pagination-controls">
            <span>
              Showing {offset + 1} - {Math.min(offset + itemsPerPage, projects.length)} of {projects.length}
            </span>
            <label>
              Items per page:
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th className="hide-on-mobile">Made at</th>
                <th className="hide-on-mobile">Built with</th>
                <th>Image</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.length > 0 &&
                currentProjects.map((project, i) => {
                  const {
                    date,
                    github,
                    external,
                    devfolio,
                    title,
                    tech,
                    placeBuiltFor,
                    cover,
                  } = project;

                  const imageUrl = cover?.localFile?.childImageSharp?.gatsbyImageData
                    ? getImage(cover.localFile.childImageSharp.gatsbyImageData)
                    : null;

                  return (
                    <tr key={i} onClick={() => handleRowClick(project)}>
                      <td>{`${new Date(date).getFullYear()} ${new Date(date).toLocaleString('default', { month: 'long' })}`}</td>
                      <td>{title}</td>
                      <td className="hide-on-mobile">
                        {placeBuiltFor ? <span>{placeBuiltFor}</span> : <span>—</span>}
                      </td>
                      <td className="hide-on-mobile">
                        {tech?.length > 0 &&
                          tech.map((item, idx) => (
                            <span key={idx}>
                              {item}
                              {idx !== tech.length - 1 && <span className="separator">&middot;</span>}
                            </span>
                          ))}
                      </td>
                      <td className="image-column">
                        {imageUrl && (
                          <GatsbyImage
                            image={imageUrl}
                            alt={title}
                            className="thumbnail"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(cover.url, true);
                            }}
                          />
                        )}
                      </td>
                      <td className="links">
                        <div>
                          {external && (
                            <a href={external} aria-label="External Link" target="_blank" rel="noopener noreferrer">
                              <Icon name="External" />
                            </a>
                          )}
                          {github && (
                            <a href={github} aria-label="GitHub Link" target="_blank" rel="noopener noreferrer">
                              <Icon name="GitHub" />
                            </a>
                          )}
                          {devfolio && (
                            <a href={devfolio} aria-label="Devfolio Link" target="_blank" rel="noopener noreferrer">
                              <Icon name="Devfolio" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <Pagination pageCount={pageCount} handlePageClick={handlePageClick} currentPage={currentPage} />
        </StyledTableContainer>
      </main>

      {selectedProject && (
        <Modal onClose={handleCloseModal}>
          <div className="project-details">
            <ProjectHeader>
              <h2>
                {selectedProject.title}
                <span className="title-icons">
                  {selectedProject.external && (
                    <a href={selectedProject.external} target="_blank" rel="noopener noreferrer" aria-label="External Link">
                      <Icon name="External" />
                    </a>
                  )}
                  {selectedProject.github && (
                    <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Link">
                      <Icon name="GitHub" />
                    </a>
                  )}
                  {selectedProject.devfolio && (
                    <a href={selectedProject.devfolio} target="_blank" rel="noopener noreferrer" aria-label="Devfolio Link">
                      <Icon name="Devfolio" />
                    </a>
                  )}
                </span>
              </h2>
            </ProjectHeader>
            
            <StyledProjectInfo>
              <p><strong>Date:</strong> {`${new Date(selectedProject.date).getFullYear()} ${new Date(selectedProject.date).toLocaleString('default', { month: 'long' })}`}</p>
              <p><strong>Made at:</strong> {selectedProject.placeBuiltFor || '—'}</p>
              <p><strong>Built with:</strong> {selectedProject.tech.join(', ')}</p>
            </StyledProjectInfo>

            <StyledProjectDescription>
              <h3>Description</h3>
              <div dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
            </StyledProjectDescription>

            {selectedProject.cover && (
              <div>
                <GatsbyImage
                  image={getImage(selectedProject.cover.localFile.childImageSharp.gatsbyImageData)}
                  alt={selectedProject.title}
                  style={{ width: '200px', cursor: 'pointer' }}
                  onClick={() => handleImageClick(selectedProject.cover.url, true)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default ArchivePage;
