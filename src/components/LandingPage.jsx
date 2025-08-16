import React from 'react';

const LandingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to TaskFlow</h1>
      <p className="text-gray-600 mb-4">
        This is a preview of the dashboard. Please log in to access all features.
      </p>
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Features Available After Login:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Complete Task Management</li>
          <li>User Profile Management</li>
          <li>Calendar Integration</li>
          <li>Notifications</li>
          <li>Advanced Filtering</li>
          <li>Admin Features (for admin users)</li>
        </ul>
      </div>
      <div className="mt-6">
        <a 
          href="/login" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-block"
        >
          Login to Get Started
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
