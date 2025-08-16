/**
 * Main Application Component
 * 
 * Serves as the root component for the TaskFlow application, handling routing,
 * authentication protection, and layout structure. Implements a comprehensive
 * routing system with protected routes and role-based access control.
 * 
 * TASK 1 IMPLEMENTATION:
 * - Users must login first to access the full list of tabs
 * - When logged out, only Dashboard panel should be displayed
 * - Landing page is now protected and only accessible after authentication
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

// nukemannkevin@gmail.com

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Layout Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

// Admin Pages
import Dashboard from "./pages/AdminPages/Dashboard";
import Users from "./pages/AdminPages/Users";
import ManageUsers from "./pages/AdminPages/ManageUsers";
import ManageTasks from "./pages/AdminPages/ManageTasks";
import Settings from "./pages/AdminPages/Settings";
import UserLogPage from "./pages/AdminPages/UserLogPage";

// User Pages
import UserDashboard from "./pages/UserPages/Dashboard";
import UserPage from "./pages/UserPages/UserPage";
import NotificationsPage from "./pages/UserPages/NotificationsPage";
import CalendarPage from "./pages/UserPages/CalendarPage";
import ProfilePage from "./pages/UserPages/ProfilePage";

// Feature Components
import TaskFilter from "./components/tasks/TaskFilter";

// Context Providers
import AuthProvider from "./contexts/AuthContext";
import NotificationProvider from "./contexts/NotificationContext";
import AdminUserLogs from "./pages/AdminPages/UserLogs";

/**
 * Protected Route Component
 * 
 * Higher-order component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page with return path.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} [props.requiredRole] - Optional role required to access the route
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, hasRole, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const isAuthenticated = !!user || !!localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If role is required, check if user has the role
  if (requiredRole) {
    const hasRequiredRole = hasRole(requiredRole);
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's role
      const userRole = localStorage.getItem("userRole");
      const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
      
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // User is authenticated and has required role (if specified)
  return children;
};


const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const isAuthenticated = !!user || !!localStorage.getItem("token");
  
  if (isAuthenticated) {
    const userRole = localStorage.getItem("userRole");
    const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={redirectPath} replace />;
  }
  
  // User is not authenticated, show public content
  return children;
};

const DashboardOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated, show limited dashboard view
  const isAuthenticated = !!user || !!localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Minimal navbar for unauthenticated users */}
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">TaskFlow</h1>
            <div className="flex space-x-4">
              <span className="text-blue-200">Dashboard Only</span>
              <a href="/login" className="hover:text-blue-200">Login</a>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // If authenticated, redirect to full app
  const userRole = localStorage.getItem("userRole");
  const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
  return <Navigate to={redirectPath} replace />;
};


// Determines where to redirect users based on authentication status
const RootHandler = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const isAuthenticated = !!user || !!localStorage.getItem("token");
  
  if (isAuthenticated) {
    // Redirect authenticated users to appropriate dashboard
    const userRole = localStorage.getItem("userRole");
    const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={redirectPath} replace />;
  } else {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" replace />;
  }
};


//  * Handles the layout structure based on authentication status

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user || !!localStorage.getItem("token");
  
  return (
    <div className="flex flex-col min-h-screen">
      {isAuthenticated && <Navbar />}
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootHandler />} />
            
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />
            

            
            {/* Protected Routes - Wrapped with AppLayout */}
            <Route 
              path="/landing" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Landing />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <Users />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <ManageUsers />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-tasks" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <ManageTasks />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/user-logs" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <UserLogPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/task-filter" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <TaskFilter />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/logs" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AdminUserLogs />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/userpage" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/notifications" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotificationsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/user/calendar" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CalendarPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/task-filter" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TaskFilter />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback Route - Redirect to root for smart handling */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;