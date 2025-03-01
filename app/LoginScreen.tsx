

import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, useWindowDimensions } from 'react-native';

const LoginScreen: React.FC = () => {
  const { width } = useWindowDimensions();

  // Define breakpoints
  const isMobile = width < 768; // Mobile screens
  const isTablet = width >= 768; // Tablet or web screens

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      {/* Left Section (Orange Background) */}
      <View style={[styles.leftSection, isMobile && styles.mobileLeftSection]}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subText}>Please log in to continue.</Text>
      </View>

      {/* Right Section (Login Form) */}
      <View style={[styles.rightSection, isMobile && styles.mobileRightSection]}>
        <Text style={styles.loginHeader}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
        />
        <Button title="Log In" onPress={() => console.log('Login pressed')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Horizontal layout for tablet/web
  },
  mobileContainer: {
    flexDirection: 'column', // Vertical layout for mobile
  },
  leftSection: {
    flex: 1,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileLeftSection: {
    flex: 0.4, // Smaller section for mobile
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileRightSection: {
    flex: 0.6, // Larger section for mobile
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subText: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
  },
  loginHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default LoginScreen;