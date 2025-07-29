import React from 'react';
import { cn } from '../../utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (record: T, index: number) => void;
  rowClassName?: (record: T, index: number) => string;
  className?: string;
  pagination?: {
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
  };
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  sortBy,
  sortDirection,
  onSort,
  onRowClick,
  rowClassName,
  className,
  pagination,
  onPageChange,
  itemsPerPage = 20,
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const key = column.key as string;
    const newDirection = sortBy === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const key = column.key as string;
    if (sortBy !== key) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }

    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-gray-600" />
      : <ChevronDown className="h-4 w-4 text-gray-600" />;
  };

  const getValue = (record: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record);
    }
    return record[key as keyof T];
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('w-full overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((record, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(record, rowIndex)
                  )}
                  onClick={() => onRowClick?.(record, rowIndex)}
                >
                  {columns.map((column, colIndex) => {
                    const value = getValue(record, column.key);
                    const content = column.render 
                      ? column.render(value, record, rowIndex)
                      : value;

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
      {/* Pagination API Platform */}
      {pagination && onPageChange && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Affichage de {Math.min((pagination.currentPage - 1) * itemsPerPage + 1, pagination.totalItems)} à{' '}
              {Math.min(pagination.currentPage * itemsPerPage, pagination.totalItems)} sur{' '}
              {pagination.totalItems} résultats
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            <span className="px-3 py-1 text-sm font-medium">
              Page {pagination.currentPage}
            </span>
            
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { Table, type Column };