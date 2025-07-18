import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/Login';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DocumentScreen from '../screens/DocumentScreen';
import apiService from '../services/apiService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Store user data
  const [loading, setLoading] = useState(false);

  // Navigation handlers
  const navigateToSignup = () => setCurrentScreen('signup');
  const navigateToLogin = () => setCurrentScreen('login');
  const navigateToDashboard = () => setCurrentScreen('dashboard');
  const navigateToProfile = () => setCurrentScreen('profile');
  const navigateToDocuments = () => setCurrentScreen('documents');

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  // Handle successful signup
  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  // Update user data
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Render current screen
  const renderScreen = () => {
    if (!isAuthenticated) {
      return currentScreen === 'signup' ? (
        <SignupScreen 
          onNavigateToLogin={navigateToLogin}
          onSignupSuccess={handleSignupSuccess}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <LoginScreen 
          onNavigateToSignup={navigateToSignup}
          onLoginSuccess={handleLoginSuccess}
          loading={loading}
          setLoading={setLoading}
        />
      );
    }

    // Authenticated screens
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen 
            user={user}
            onNavigateToProfile={navigateToProfile}
            onNavigateToDocuments={navigateToDocuments}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            user={user}
            onNavigateBack={navigateToDashboard}
            onLogout={handleLogout}
            onUpdateUser={updateUser}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 'documents':
        return (
          <DocumentScreen 
            user={user}
            onNavigateBack={navigateToDashboard}
            loading={loading}
            setLoading={setLoading}
          />
        );
      default:
        return (
          <DashboardScreen 
            user={user}
            onNavigateToProfile={navigateToProfile}
            onNavigateToDocuments={navigateToDocuments}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});