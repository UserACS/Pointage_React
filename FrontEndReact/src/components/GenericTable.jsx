import React, { useState } from 'react';
import './GenericTable.css';

const GenericTable = ({ 
  data, 
  columns, 
  onRowClick, 
  onEdit, 
  onDelete, 
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  showActions = true,
  userRole = null
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField || !data) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const paginatedData = React.useMemo(() => {
    if (!sortedData) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="generic-table">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="th-content">
                    {column.label}
                    {column.sortable && (
                      <span className="sort-indicator">
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (userRole === 'admin' || userRole === 'manager') && (
                <th className="actions-column">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr 
                key={row.id || row._id || index}
                className={onRowClick ? 'clickable' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {showActions && (userRole === 'admin' || userRole === 'manager') && (
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {onEdit && (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            className="btn btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </button>
          
          <span className="page-info">
            Page {currentPage} sur {totalPages}
          </span>
          
          <button
            className="btn btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </button>
        </div>
      )}

      <div className="table-info">
        Affichage de {paginatedData.length} sur {data.length} éléments
      </div>
    </div>
  );
};

export default GenericTable;
