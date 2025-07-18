// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';

const LoginScreen = ({ onNavigateToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Static credentials - kept in LoginScreen
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin';

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      // Check credentials internally
      if (email.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Login successful
        console.log('Login successful');
        onLoginSuccess(); // Notify App.js of successful login
      } else {
        // Show error for invalid credentials
        Alert.alert(
          'Login Failed', 
          'Invalid credentials. Please use:\nUsername: admin\nPassword: admin'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            {/* Image placeholder with border */}
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholderWithBorder}>
                <View style={styles.imagePlaceholder}>
                  <View style={styles.mountainIcon}>
                    {/* Mountain-like icon */}
                    <View style={styles.peak} />
                    <View style={styles.peak2} />
                  </View>
                </View>
              </View>
            </View>
            
            {/* Login hint text */}
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>Demo Login:</Text>
              <Text style={styles.hintCredentials}>Username: admin</Text>
              <Text style={styles.hintCredentials}>Password: admin</Text>
            </View>
            
            {/* Form fields */}
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email Address or Username"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
              
              {/* Forgot password text aligned to the right */}
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              
              {/* Login button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              {/* Signup link */}
              <View style={styles.signupLinkContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateToSignup} disabled={loading}>
                  <Text style={[styles.signupLink, loading && styles.linkDisabled]}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  imagePlaceholderWithBorder: {
    width: 110,
    height: 110,
    borderWidth: 2,
    borderColor: '#9c27b0', // Purple border as shown in wireframe
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mountainIcon: {
    width: 40,
    height: 30,
    position: 'relative',
  },
  peak: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#aaa',
  },
  peak2: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#888',
  },
  hintContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d13b3b',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  hintCredentials: {
    fontSize: 13,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#d13b3b', // Using the reddish color from the wireframe
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#d13b3b',
    fontWeight: '600',
  },
  linkDisabled: {
    color: '#cccccc',
  },
});

export default LoginScreen;