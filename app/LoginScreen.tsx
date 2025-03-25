import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router'; // Use Expo Router for navigation
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

const LoginScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Define isMobile based on screen width
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    const collections = [
      "Admin",
      "deliverydriver",
      "customer",
      "fieldagent",
      "transporter",
    ];
    let userFound = false;

    if (!phoneNumber || !password) {
      setErrorMessage("Please enter both phone number and password.");
      setModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      for (const collectionName of collections) {
        const userQuery = query(
          collection(db, collectionName),
          where("phoneNumber", "==", phoneNumber)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            if (userData.password === password) {
              userFound = true;

              // Save phone number to AsyncStorage for persistence
              await AsyncStorage.setItem("phoneNumber", phoneNumber);

              // Redirect user based on their collection name
              let screen: any = "/dashboard"; // Default screen
              if (collectionName === "customer") {
                screen = "/customer/dashboard";
              } else if (collectionName === "deliverydriver") {
                screen = "/driver/notificationScreen";
              } else if (collectionName === "fieldagent") {
                screen = "/agent/dashboard";
              } else if (collectionName === "transporter") {
                screen = "/transporter/dashboard";
              } else if (collectionName === "Admin") {
                screen = "/dashboard";
              }

              setLoading(false);
              router.push(screen); // Navigate to the appropriate screen
              return;
            }
          }
        }
      }

      if (!userFound) {
        setErrorMessage("Invalid phone number or password.");
        setModalVisible(true);
      }
    } catch (error: any) {
      setErrorMessage(`Login failed: ${error.message}`);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      {/* Modified Left Section */}
      <LinearGradient 
        colors={['#FFA500', '#FF8C00']}
        style={[styles.leftSection, isMobile && styles.mobileLeftSection]}
      >
        <Image
          source={require('../assets/images/Glyde.png')}
          style={[
            styles.logo,
            { 
              width: isMobile ? width * 0.4 : width * 0.2,
              height: isMobile ? width * 0.4 : width * 0.2 
            }
          ]}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subText}>Please log in to continue.</Text>
        </View>
      </LinearGradient>

      {/* Right Section (Login Form) */}
      <View style={[styles.rightSection, isMobile && styles.mobileRightSection]}>
        <Text style={styles.loginHeader}>Login</Text>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="phone" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        {loading ? (
          <ActivityIndicator size="large" color="orange" />
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <LinearGradient
              colors={['#FFA500', '#FF4500']}
              style={styles.gradient}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileContainer: {
    flexDirection: 'column',
  },
  leftSection: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileLeftSection: {
    flex: 0.4,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileRightSection: {
    flex: 0.6,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  subText: {
    fontSize: 16,
    color: 'black',
    marginTop: 10,
  },
  loginHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  loginButton: {
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  textContainer: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
});

export default LoginScreen;