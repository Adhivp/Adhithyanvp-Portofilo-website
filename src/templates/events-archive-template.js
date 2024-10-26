import React, { useState, useEffect, useRef } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { Helmet } from 'react-helmet';
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
      cursor: pointer;

      &:hover,
      &:focus {
        background-color: var(--light-navy);
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
      }

      &.location {
        font-size: var(--fz-lg);
        white-space: nowrap;
      }

      &.image {
        width: 100px;
        height: 100px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--border-radius);
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
    }
  }

  .image-column {
    width: 50px;
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
`;

const StyledButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  button {
    ${({ theme }) => theme.mixins.button};
    margin: 0 10px;
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
  z-index: 2000;
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

const EventHeader = styled.div`
  margin-bottom: 20px;

  h2 {
    font-size: var(--fz-heading);
    margin-bottom: 10px;
  }

  .title-icons {
    display: inline-flex;
    align-items: center;
    margin-left: 10px;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;

      &:hover {
        color: var(--green);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const StyledEventInfo = styled.div`
  margin-bottom: 20px;

  p {
    margin-bottom: 5px;
  }

  .hackathon-label {
    display: inline-flex;
    align-items: center;
    background-color: var(--green);
    color: var(--navy);
    padding: 5px 10px;
    border-radius: 4px;
    font-size: var(--fz-sm);
    font-weight: 600;

    .tick-icon {
      margin-left: 5px;
      width: 12px;
      height: 12px;
    }
  }
`;

const StyledEventDescription = styled.div`
  h3 {
    margin-bottom: 10px;
  }
`;

const EventsArchivePage = ({ location }) => {
  const data = useStaticQuery(graphql`
    query {
      allStrapiEvent(sort: {date: DESC}) {
        nodes {
          id
          title
          date
          location
          linkedin
          IsHackathon
          content {
            data {
              content
            }
          }
          cover {
            localFile {
              childImageSharp {
                gatsbyImageData(width: 200, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
              }
            }
          }
        }
      }
    }
  `);

  const events = data.allStrapiEvent.nodes;

  const [activeSection, setActiveSection] = useState('all');
  const revealTitle = useRef(null);
  const revealTable = useRef(null);
  const revealEvents = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleImageClick = (cover) => {
    const imageUrl = cover?.localFile?.childImageSharp?.gatsbyImageData
        ? getImage(cover.localFile.childImageSharp.gatsbyImageData)
        : '';
    setPopupImageUrl(imageUrl);
    setIsPopupOpen(true);
  };

  const handleCloseImagePopup = () => {
    setIsPopupOpen(false);
    setPopupImageUrl('');
  };

  const handleRowClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealTable.current, srConfig(200, 0));
    revealEvents.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 10)));
  }, [prefersReducedMotion]);

  const pageCount = Math.ceil(events.length / itemsPerPage);
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  const filteredEvents =
    activeSection === 'all'
      ? events
      : events.filter(event => event.isHackathon);

  const offset = currentPage * itemsPerPage;
  const currentEvents = filteredEvents.slice(offset, offset + itemsPerPage);

  return (
    <Layout location={location}>
      <Helmet title="Events Archive" />

      <main>
        <header ref={revealTitle}>
          <h1 className="big-heading">Events Archive</h1>
          <p className="subtitle">A Big list of events I've attended</p>
        </header>
        <br />
        <StyledButtonGroup>
          <button onClick={() => setActiveSection('all')}>All Events ({events.length})</button>
          <button onClick={() => setActiveSection('hackathons')}>Hackathons ({events.filter(event => event.isHackathon).length})</button>
        </StyledButtonGroup>

        <StyledTableContainer ref={revealTable} isBlurred={isPopupOpen}>
          <div className="pagination-controls">
            <span>
              Showing {offset + 1} - {Math.min(offset + itemsPerPage, filteredEvents.length)} of {filteredEvents.length}
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
                <th>Event</th>
                <th className="hide-on-mobile">Location</th>
                <th className="hide-on-mobile">Image</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 &&
                currentEvents.map((event, i) => {
                  const { title, date, location, linkedin, cover } = event;

                  return (
                    <tr key={i} ref={el => (revealEvents.current[i] = el)} onClick={() => handleRowClick(event)}>
                      <td className="year">{`${new Date(date).getDate()}${['th', 'st', 'nd', 'rd'][((new Date(date).getDate() % 10) - 1) % 10] || 'th'} ${new Date(date).toLocaleString('default', { month: 'long' })} ${new Date(date).getFullYear()}`}</td>
                      <td className="title">{title}</td>
                      <td className="location hide-on-mobile">
                        {location ? <span>{location}</span> : <span>—</span>}
                      </td>
                      <td className="image-column">
                        {cover?.localFile?.childImageSharp?.gatsbyImageData && (
                          <GatsbyImage
                            image={getImage(cover.localFile.childImageSharp.gatsbyImageData)}
                            alt={title}
                            className="thumbnail"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(cover);
                            }}
                          />
                        )}
                      </td>
                      <td className="links">
                        <div>
                          {linkedin && (
                            <a href={linkedin} aria-label="LinkedIn Link" target="_blank" rel="noopener noreferrer">
                              <Icon name="LinkedIn" />
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

      {selectedEvent && (
        <Modal onClose={handleCloseModal}>
          <div className="event-details">
            <EventHeader>
              <h2>
                {selectedEvent.title}
                <span className="title-icons">
                  {selectedEvent.linkedin && (
                    <a href={selectedEvent.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Link">
                      <Icon name="LinkedIn" />
                    </a>
                  )}
                </span>
              </h2>
            </EventHeader>

            <StyledEventInfo>
              <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {selectedEvent.location || '—'}</p>
              {selectedEvent.isHackathon && (
                <p className="hackathon-label">
                  Hackathon
                  <Icon name="Tick" className="tick-icon" />
                </p>
              )}
            </StyledEventInfo>

            <StyledEventDescription>
              <h3>Description</h3>
              <div dangerouslySetInnerHTML={{ __html: selectedEvent.content.data.content || 'No description provided.' }} />
            </StyledEventDescription>

            {selectedEvent.cover?.localFile?.childImageSharp?.gatsbyImageData && (
              <div>
                <GatsbyImage
                  image={getImage(selectedEvent.cover.localFile.childImageSharp.gatsbyImageData)}
                  alt={selectedEvent.title}
                  style={{ width: '200px', cursor: 'pointer' }}
                  onClick={() => handleImageClick(selectedEvent.cover)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {isPopupOpen && (
        <PopupOverlay onClick={handleCloseImagePopup}>
          <PopupContent onClick={(e) => e.stopPropagation()}>
            {popupImageUrl && (
              <img src={popupImageUrl} alt="Full size" />
            )}
          </PopupContent>
        </PopupOverlay>
      )}
    </Layout>
  );
};

export default EventsArchivePage;
