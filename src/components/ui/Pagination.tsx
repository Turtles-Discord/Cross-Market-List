import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = false,
  maxVisiblePages = 5,
}: PaginationProps) {
  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    // Adjust if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-center ${className}`}
      aria-label="Pagination"
    >
      <ul className="flex space-x-1">
        {/* Previous button */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              flex items-center justify-center h-9 w-9 rounded-md
              ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
        </li>

        {/* First page and ellipsis */}
        {showFirstLast && pageNumbers[0] > 1 && (
          <>
            <li>
              <button
                onClick={() => handlePageClick(1)}
                className={`
                  flex items-center justify-center h-9 w-9 rounded-md
                  text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                1
              </button>
            </li>
            {pageNumbers[0] > 2 && (
              <li className="flex items-center justify-center h-9 px-2 text-gray-400">
                ...
              </li>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map((page) => (
          <li key={page}>
            <button
              onClick={() => handlePageClick(page)}
              className={`
                flex items-center justify-center h-9 w-9 rounded-md
                ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Last page and ellipsis */}
        {showFirstLast && pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <li className="flex items-center justify-center h-9 px-2 text-gray-400">
                ...
              </li>
            )}
            <li>
              <button
                onClick={() => handlePageClick(totalPages)}
                className={`
                  flex items-center justify-center h-9 w-9 rounded-md
                  text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next button */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              flex items-center justify-center h-9 w-9 rounded-md
              ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </li>
      </ul>
    </nav>
  );
} 