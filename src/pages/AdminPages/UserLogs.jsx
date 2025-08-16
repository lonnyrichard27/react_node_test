import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/admin/Sidebar';

const AdminUserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null); 
  const [logToDelete, setLogToDelete] = useState(null);

  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    fetchUserLogs();
  }, [filters]);

  /**
   * Get authentication token
   */
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  /**
   * Fetch user logs from API
   */
  const fetchUserLogs = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${API_BASE_URL}/admin/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast.error('Failed to load user logs');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  /**
   * Delete single log
   */
  const deleteSingleLog = async (logId) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/admin/logs/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete log');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Log deleted successfully');
        fetchUserLogs(); // Refresh logs
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      toast.error('Failed to delete log');
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = () => {
    if (deleteAction === 'single' && logToDelete) {
      deleteSingleLog(logToDelete);
    }
    
    setShowDeleteModal(false);
    setDeleteAction(null);
    setLogToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 User Activity Logs
          </h1>
          <p className="text-gray-600">Monitor user login/logout activities and manage system logs</p>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No logs found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log Out Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JWT Token Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                          <div className="text-sm text-gray-500">{log.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(log.loginTime)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {log.logoutTime ? formatDate(log.logoutTime) : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                        {log.ipAddress}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                        {log.tokenId}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setDeleteAction('single');
                            setLogToDelete(log._id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalLogs} total logs)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                {deleteAction === 'single' && 'Are you sure you want to delete this log entry?'}
                {deleteAction === 'all' && 'Are you sure you want to delete ALL log entries? This action cannot be undone!'}
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserLogs;