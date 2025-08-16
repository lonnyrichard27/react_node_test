import React, { useState, useEffect } from "react";
import UserSidebar from "./UserSidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });


  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // API base URL
  const API_BASE_URL = 'http://localhost:5001/api';

   // Re-fetch when status filter changes
  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

     // Apply search filter to tasks
  useEffect(() => {
    applySearchFilter();
  }, [tasks, searchQuery]);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };


  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required. Please login first.');
        return;
      }

      // Build query parameters - only status filter
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append('status', statusFilter);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/tasks${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
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
        setTasks(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const applySearchFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) 
    );
    setFilteredTasks(filtered);
  };


  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Handle Task Creation via API
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required. Please login first.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTask.title.trim(),
          description: newTask.description.trim(),
          priority: newTask.priority.toLowerCase(),
          dueDate: new Date(newTask.dueDate).toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success("Task added successfully!", { icon: "✅" });
        
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
        
        await fetchTasks();
      } else {
        throw new Error(result.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error(err.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteTask = async (taskId) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required. Please login first.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success("Task deleted successfully!", { icon: "🗑️" });
        // Refresh tasks list
        await fetchTasks();
      } else {
        throw new Error(result.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error(err.message || 'Failed to delete task. Please try again.');
    }
  };


  // Handle Task Update (for editing existing tasks)
  const updateTask = async (taskId, updatedData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required. Please login first.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state immediately
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { ...task, ...result.data }
              : task
          )
        );
        toast.success("Task updated successfully!", { icon: "✅" });
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error(err.message || 'Failed to update task. Please try again.');
      throw err;
    }
  };

  // Toggle task status between complete/incomplete
  const toggleTaskStatus = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Error toggling task status:', err);
    }
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task._id);
    setEditingTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0], 
    });
  };


  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
  };

  // Save edited task
  const saveEditedTask = async () => {
    if (!editingTask.title.trim() || !editingTask.description.trim() || !editingTask.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateTask(editingTaskId, {
        title: editingTask.title.trim(),
        description: editingTask.description.trim(),
        priority: editingTask.priority.toLowerCase(),
        dueDate: new Date(editingTask.dueDate).toISOString()
      });
      
      cancelEditing();
    } catch {
      // Error is already handled in updateTask function
    }
  };

  // Function to get priority color
  const getPriorityColor = (priority) => {
    if (priority === "high") return "text-red-600 font-bold";
    if (priority === "medium") return "text-yellow-600 font-bold";
    return "text-green-600 font-bold"; // Low priority
  };

  // Function to get priority display text
  const getPriorityDisplay = (priority) => {
    if (priority === "high") return "🔥 High Priority";
    if (priority === "medium") return "⚡ Medium Priority";
    if (priority === "low") return "✅ Low Priority";
    return priority;
  };

  // Get the tasks to display (filtered by search if applicable)
  const tasksToDisplay = filteredTasks;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />

      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-6 text-center w-full">
          <span>🎯</span> 
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            User Task Management
          </span>
        </h1>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        {/* Search and Filter Controls */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">🔍 Search & Filter</h2>
            <button
              onClick={clearFilters}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
            >
              Clear All
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search tasks by title or description..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter Only */}
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="complete">✅ Completed</option>
              <option value="incomplete">⏳ Incomplete</option>
            </select>
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 flex flex-wrap gap-2">
            {statusFilter !== "all" && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Status: {statusFilter}
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Search: "{searchQuery.trim()}"
              </span>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-2 text-sm text-gray-600">
            Showing {tasksToDisplay.length} of {tasks.length} tasks
          </div>
        </div>

        {/* Task Creation Box */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Title *</label>
              <input
                type="text"
                placeholder="Enter task title"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                placeholder="Enter task description"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="high">🔥 High Priority</option>
                  <option value="medium">⚡ Medium Priority</option>
                  <option value="low">✅ Low Priority</option>
                </select>
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg font-semibold text-lg transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? '⏳ Creating...' : '➕ Add Task'}
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && tasks.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasksToDisplay.length === 0 ? (
            <div className="col-span-full text-center py-8">
              {searchQuery.trim() || statusFilter !== "all" ? (
                <div>
                  <p className="text-gray-600 mb-4">No tasks found matching your search or filter.</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              ) : (
                <p className="text-gray-600">No tasks created yet. Start by adding a task!</p>
              )}
            </div>
          ) : (
            tasksToDisplay.map((task) => (
              <div key={task._id} className="bg-white shadow-md p-4 rounded-md border-l-4 border-blue-400">
                {editingTaskId === task._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        rows="3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={editingTask.priority}
                          onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                        >
                          <option value="high">🔥 High</option>
                          <option value="medium">⚡ Medium</option>
                          <option value="low">✅ Low</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={editingTask.dueDate}
                          onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditedTask}
                        className="flex-1 bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700 transition-all text-sm"
                      >
                        ✅ Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 bg-gray-600 text-white p-2 rounded font-semibold hover:bg-gray-700 transition-all text-sm"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold flex-1">{task.title}</h3>
                      <button
                        onClick={() => startEditingTask(task)}
                        className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        ✏️
                      </button>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>

                    <div className="space-y-2 mb-4">
                      <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                        Priority: {getPriorityDisplay(task.priority)}
                      </span>

                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Status:</span> 
                        <span className={`ml-1 ${task.status === 'complete' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {task.status === 'complete' ? '✅ Complete' : '⏳ In Progress'}
                        </span>
                      </p>

                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Due Date:</span> {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Progress:</label>
                        <button
                          onClick={() => toggleTaskStatus(task._id)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            task.status === 'complete'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {task.status === 'complete' ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.status === 'complete' ? 100 : 0}
                        className="w-full accent-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {task.status === 'complete' ? '100%' : '0%'} Completed
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="w-full bg-red-600 text-white p-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                    >
                      🗑️ Delete Task
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;