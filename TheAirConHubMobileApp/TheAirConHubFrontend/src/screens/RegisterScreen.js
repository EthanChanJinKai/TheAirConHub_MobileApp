// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Needed for Auto-Login
import { API_URL } from '../config';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', username: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateField = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrorMessage('');
  };

  const handleRegister = async () => {
    setErrorMessage('');

    // --- VALIDATION ---
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (formData.password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. REGISTER REQUEST
      const registerResponse = await fetch(`${API_URL}/Auth/Register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(formData),
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        setErrorMessage(errorText || 'Registration failed.');
        setLoading(false);
        return; 
      }

      // 2. AUTO-LOGIN (If Register success, immediately log them in)
      const loginResponse = await fetch(`${API_URL}/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ 
          usernameOrEmail: formData.username, 
          password: formData.password 
        }),
      });

      if (loginResponse.ok) {
        const userData = await loginResponse.json();
        
        // Save Session
        await AsyncStorage.setItem('userSession', JSON.stringify(userData));
        
        // Navigate to Home (Skip Login Screen entirely)
        navigation.replace('MainTabs'); 
      } else {
        // Fallback: If auto-login fails for some weird reason, go to login screen
        navigation.replace('Login');
      }

    } catch (error) {
      setErrorMessage('Could not connect to server.');
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join The AirCon Hub</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Full Name" 
        value={formData.fullName}
        onChangeText={t => updateField('fullName', t)} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Email (e.g. name@school.com)" 
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={t => updateField('email', t)} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        autoCapitalize="none"
        value={formData.username}
        onChangeText={t => updateField('username', t)} 
      />
      
      {/* PASSWORD */}
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.passwordInput} 
          placeholder="Password" 
          secureTextEntry={!showPass}
          value={formData.password}
          onChangeText={t => updateField('password', t)} 
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
          {showPass ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
        </TouchableOpacity>
      </View>

      {/* CONFIRM PASSWORD */}
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.passwordInput} 
          placeholder="Confirm Password" 
          secureTextEntry={!showConfirmPass}
          value={confirmPassword}
          onChangeText={(t) => { setConfirmPassword(t); setErrorMessage(''); }} 
        />
        <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
          {showConfirmPass ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up & Login</Text>}
      </TouchableOpacity>

      {/* Error Text Only (No Popups) */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
        <Text style={{color: '#2563EB', textAlign: 'center'}}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2563EB', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, marginBottom: 15 },
  passwordInput: { flex: 1, padding: 15, fontSize: 16 },
  eyeIcon: { padding: 15 },
  button: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#DC2626', textAlign: 'center', marginTop: 15, fontSize: 14, fontWeight: '600' }
});

export default RegisterScreen;