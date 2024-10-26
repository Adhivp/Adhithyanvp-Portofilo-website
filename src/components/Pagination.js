import React from 'react';
import ReactPaginate from 'react-paginate';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;

  .pagination {
    display: flex;
    list-style: none;
    padding: 0;

    li {
      margin: 0 5px;

      a {
        padding: 8px 12px;
        border: 1px solid var(--white);
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        color: var(--white);
        transition: background-color 0.2s, color 0.2s, border-color 0.2s;

        &.selected {
          background-color: var(--green);
          color: var(--navy);
          border-color: var(--green);
        }

        &:hover:not(.selected) {
          background-color: var(--green);
          color: var(--navy);
          border-color: var(--green);
        }
      }

      &.disabled a {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          background-color: transparent;
          color: var(--white);
          border-color: var(--white);
        }
      }
    }
  }
`;

const PaginationComponent = ({ pageCount, handlePageClick, currentPage }) => (
  <StyledPagination>
    <ReactPaginate
      previousLabel={'Previous'}
      nextLabel={'Next'}
      breakLabel={'...'}
      breakClassName={'break-me'}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={handlePageClick}
      containerClassName={'pagination'}
      activeClassName={'selected'}
      forcePage={currentPage}
    />
  </StyledPagination>
);

PaginationComponent.propTypes = {
  pageCount: PropTypes.number.isRequired,
  handlePageClick: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default PaginationComponent;
