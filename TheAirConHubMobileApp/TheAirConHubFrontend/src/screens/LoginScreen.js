// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ usernameOrEmail: username, password: password }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('userSession', JSON.stringify(data));
        
        // Go back to the Main Tabs (Account Screen)
        navigation.replace('MainTabs'); 
      } else {
        const errorMsg = await response.text();
        setErrorMessage(errorMsg || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>The AirCon Hub</Text>
        <Text style={styles.subtitle}>Login</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Username or Email" 
          placeholderTextColor="#666666"
          value={username} 
          onChangeText={(text) => { setUsername(text); setErrorMessage(''); }}
          autoCapitalize="none" 
        />

        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder="Password" 
            placeholderTextColor="#666666"
            value={password} 
            onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
            secureTextEntry={!showPassword} 
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
        </TouchableOpacity>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{marginTop: 20}}>
          <Text style={{color: '#2563EB', textAlign: 'center'}}>New here? Create an Account</Text>
        </TouchableOpacity>
        
        {/* Added a cancel button to go back to app without logging in */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 15}}>
          <Text style={{color: '#666', textAlign: 'center'}}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ... keep existing styles ...
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F7FA' },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2563EB', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, color: '#000' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, marginBottom: 15 },
  passwordInput: { flex: 1, padding: 15, fontSize: 16, color: '#000' },
  eyeIcon: { padding: 15 },
  button: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#DC2626', textAlign: 'center', marginTop: 15, fontSize: 14, fontWeight: '600' }
});

export default LoginScreen;