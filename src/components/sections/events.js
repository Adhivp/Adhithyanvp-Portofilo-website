import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { IconExternal, IconLinkedin } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';
import { getImage, GatsbyImage } from 'gatsby-plugin-image';
import { graphql, useStaticQuery } from 'gatsby';
import ReactMarkdown from 'react-markdown';

const StyledEventsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
    margin-bottom: 20px;
  }

  .inner {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .events-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
    position: relative;
    margin-top: 50px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;

      .img {
        opacity: 1 !important;
      }
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.bigButton}; // <-- Use bigButton mixin
    margin: 80px auto 0;
  }

  .divider {
    width: 100%;
    height: 1px;
    background-color: var(--lightest-navy);
    margin: 50px 0 30px;
  }

  .archive-link {
    ${({ theme }) => theme.mixins.inlineLink};
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    text-align: center;
    &:after {
      bottom: 0.1em;
    }
  }

  .event-image {
    ${({ theme }) => theme.mixins.boxShadow};
    grid-column: 6 / -1;
    grid-row: 1 / -1;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      height: 100%;
      opacity: 1;
    }

    a {
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      vertical-align: middle;
      display: block;

      &:hover,
      &:focus {
        outline: 0;
      }
    }

    .img {
      border-radius: var(--border-radius);

      @media (max-width: 768px) {
        object-fit: cover;
        width: auto;
        height: 100%;
      }
    }
  }
`;

const StyledEvent = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);
  overflow: hidden;

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .event-inner {
        transform: translateY(-7px);
      }
      box-shadow: var(--shadow-hover);
    }
  }

  a {
    position: relative;
    z-index: 1;
    color: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;

    &:hover,
    &:focus {
      color: var(--green);
    }

    svg {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ease, color 0.3s ease;

      &:hover,
      &:focus {
        color: var(--green);
      }
    }
  }

  .event-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 1.5rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .event-image {
    ${({ theme }) => theme.mixins.boxShadow};
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius);
    height: 250px;

    a {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;

      &:hover,
      &:focus {
        outline: 0;
      }

      .img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: var(--transition);
      }
    }
  }

  .event-links {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--light-slate);

    a {
      ${({ theme }) => theme.mixins.flexCenter};
      padding: 5px 7px;

      svg {
        width: 20px;
        height: 20px;
      }

      &.external {
        svg {
          width: 22px;
          height: 22px;
          margin-top: -4px;
        }
      }

      &:hover,
      &:focus {
        color: var(--green);
      }
    }
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    margin-top: 15px;
    margin-bottom: 10px;
    gap: 10px;
  }

  .event-title {
    margin: 0;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
    flex: 1;
    min-width: 0;
    word-break: break-word;

    a {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover,
      &:focus {
        color: var(--green);
        text-decoration: underline;
      }
    }
  }

  .event-description {
    color: var(--light-slate);
    font-size: 17px;
    margin-bottom: 10px;

    .description-text {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;

      &.expanded {
        display: block;
        -webkit-line-clamp: unset;
      }
    }

    .read-more-btn {
      background: none;
      border: none;
      color: var(--green);
      font-size: var(--fz-sm);
      font-family: var(--font-mono);
      cursor: pointer;
      padding: 5px 0;
      margin-top: 5px;

      &:hover {
        text-decoration: underline;
      }
    }

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }

    strong {
      color: var(--lightest-slate);
    }
  }

  .event-footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-top: 10px;

    .event-date,
    .event-location {
      color: var(--light-slate);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      text-transform: uppercase;
      margin-right: 15px;
    }
  }

  @media (max-width: 768px) {
    .event-inner {
      padding: 1rem 1.25rem;
    }

    .event-image {
      height: 200px;
      margin-bottom: 15px;
    }

    .event-title {
      font-size: var(--fz-lg);
    }

    .event-description {
      font-size: 16px;
    }

    .event-date,
    .event-location {
      font-size: var(--fz-xxxs);
    }

    .event-links a {
      margin-left: 8px;
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;


const Events = () => {
  const data = useStaticQuery(graphql`
  query EventsSectionQuery {
  allStrapiEvent(sort: {date: DESC}) {
    nodes {
      id
      title
      date(formatString: "MMMM DD, YYYY")
      location
      cover {
        localFile {
          childImageSharp {
            gatsbyImageData(width: 600, placeholder: BLURRED, formats: [AUTO])
          }
        }
      }
      content {
        data {
          content
        }
      }
      linkedin
      external
    }
  }
}
  `);

  const events = data.allStrapiEvent.nodes || [];
  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealEvents = useRef([]);
  const revealButtonShowMore = useRef(null);
  const revealButtonArchive = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealButtonShowMore.current, srConfig());
    sr.reveal(revealButtonArchive.current, srConfig());
    revealEvents.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, [prefersReducedMotion]);

  const GRID_LIMIT = 4;
  const MAX_EVENTS = 8;
  const limitedEvents = events.slice(0, MAX_EVENTS);
  const firstFour = limitedEvents.slice(0, GRID_LIMIT);
  const eventsToShow = showMore ? limitedEvents : firstFour;

  const EventCard = ({ event }) => {
    const [expanded, setExpanded] = useState(false);
    const { title, location, date, cover, content, linkedin, external } = event;
    const contentString =
      typeof content?.data?.content === 'string' ? content.data.content : '';
    const needsReadMore = contentString.length > 150;

    return (
      <div className="event-inner">
            <div className="event-image">
              {cover?.localFile?.childImageSharp?.gatsbyImageData ? (
                <a
                  href={
                    external
                      ? external.startsWith('https')
                        ? external
                        : `https://${external}`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GatsbyImage
                    image={getImage(cover.localFile.childImageSharp.gatsbyImageData)}
                    alt={`${title || 'Event'} Image`}
                    className="img"
                  />
                </a>
              ) : (
                <div className="placeholder-image">No Image Available</div>
              )}
            </div>

        <div className="event-header">
          <h3 className="event-title">
            {external ? (
              <a
                href={
                  external.startsWith('https') ? external : `https://${external}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {title || 'Untitled Event'}
              </a>
            ) : (
              <span>{title || 'Untitled Event'}</span>
            )}
          </h3>
          <div className="event-links">
            {linkedin && (
              <a
                href={
                  linkedin.startsWith('https') ? linkedin : `https://${linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <IconLinkedin />
              </a>
            )}
            {external && (
              <a
                href={
                  external.startsWith('https') ? external : `https://${external}`
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-label="External Link"
                className="external"
              >
                <IconExternal />
              </a>
            )}
          </div>
        </div>

        <div className="event-description">
          <div className={`description-text ${expanded ? 'expanded' : ''}`}>
            <ReactMarkdown>{contentString || 'No Description Available.'}</ReactMarkdown>
          </div>
          {needsReadMore && (
            <button
              className="read-more-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '↑ Read less' : '↓ Read more'}
            </button>
          )}
        </div>

        <footer className="event-footer">
          <span className="event-date">{date || 'Date not available'}</span>
          <span className="event-location">{location || 'Location not available'}</span>
        </footer>
      </div>
    );
  };

  return (
    <StyledEventsSection id="events">
          <h2 className="numbered-heading" ref={revealTitle}>
            Latest Events I've Attended/<br />
            Conducted
          </h2>
      <Link className="inline-link archive-link" to="/events-archive" ref={revealButtonArchive}>
        View Full Events Archive
      </Link>
      {events.length > 0 && (
        <ul className="events-grid">
          {prefersReducedMotion ? (
            <>
              {eventsToShow &&
                eventsToShow.map((event, i) => (
                  <StyledEvent key={event.id}><EventCard event={event} /></StyledEvent>
                ))}
            </>
          ) : (
            <TransitionGroup component={null}>
              {eventsToShow &&
                eventsToShow.map((event, i) => (
                  <CSSTransition
                    key={event.id}
                    classNames="fadeup"
                    timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                    exit={false}
                  >
                    <StyledEvent
                      ref={(el) => (revealEvents.current[i] = el)}
                      style={{
                        transitionDelay: `${
                          i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0
                        }ms`,
                      }}
                    >
                      <EventCard event={event} />
                    </StyledEvent>
                  </CSSTransition>
                ))}
            </TransitionGroup>
          )}
        </ul>
      )}
      {events.length > GRID_LIMIT && (
        <button
          className="more-button"
          onClick={() => setShowMore(!showMore)}
          ref={revealButtonShowMore}
        >
          Show {showMore ? 'Less' : 'More'}
        </button>
      )}

      <div className="divider" />

      <Link
        className="inline-link archive-link"
        to="/events-archive"
        ref={revealButtonArchive}
      >
        View Full Events Archive
      </Link>
    </StyledEventsSection>
  );
};

export default Events;
