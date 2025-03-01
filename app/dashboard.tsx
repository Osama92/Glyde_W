import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { router } from 'expo-router';

const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Image
          source={require('../assets/images/Glyde.png')}
          resizeMode="contain"
          style={{ width: width / 4, height: width / 4 }}
        />
        <Text style={styles.welcomeText}>Welcome to the Dashboard!</Text>
        <Text style={styles.subText}>You have successfully logged in.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mobileContainer: {
    padding: 10,
  },
  header: {
    backgroundColor: 'orange',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default DashboardScreen;