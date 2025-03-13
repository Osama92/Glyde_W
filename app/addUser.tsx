import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { app } from '../firebase';
import { router } from 'expo-router';

const db = getFirestore(app);

const collections = [
  { id: 'deliverydriver', name: 'Delivery Driver' },
  { id: 'customer', name: 'Customer' },
  { id: 'transporter', name: 'Transporter' },
  { id: 'fieldagent', name: 'Field Agent' },
];

const AddUserScreen: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [assignedVanNo, setAssignedVanNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [transporter, setTransporter] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { width } = Dimensions.get('window');
  const isWeb = width >= 768; // Check if the screen width is for web

  const handleSave = async () => {
    if (!selectedCollection) {
      Alert.alert('Error', 'Please select a collection');
      return;
    }

    if (
      selectedCollection === 'deliverydriver' &&
      (!phoneNumber || !name || !assignedVanNo || !transporter || !password)
    ) {
      Alert.alert('Error', 'All fields are required for Delivery Driver');
      return;
    }

    if (selectedCollection === 'customer' && (!phoneNumber || !name || !password)) {
      Alert.alert('Error', 'All fields are required for Customer');
      return;
    }

    const uid = `${phoneNumber}_${name}`;
    const userData: Record<string, any> = { uid };

    if (selectedCollection === 'deliverydriver') {
      Object.assign(userData, {
        AssignedVanNo: assignedVanNo,
        phoneNumber: phoneNumber,
        name: name,
        Transporter: transporter,
        password: password,
      });
    } else if (selectedCollection === 'customer') {
      Object.assign(userData, {
        phoneNumber: phoneNumber,
        name: name,
        password: password,
      });
    }

    setIsLoading(true); // Show loading indicator
    try {
      await setDoc(doc(db, selectedCollection, uid), userData);
      Alert.alert('Success', 'User added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
      console.error(error);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.topSection}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Back</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 20, marginTop: 20 }}>
          <Image
            source={require('../../assets/images/Back.png')}
            style={{ width: 30, resizeMode: 'contain', marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, isWeb && styles.scrollContainerWeb]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Select Collection</Text>
        <SearchableDropdown
          onItemSelect={(item) => setSelectedCollection(item.id)}
          items={collections}
          placeholder={
            selectedCollection ? collections.find((c) => c.id === selectedCollection)?.name : 'Select Category..'
          }
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemTextStyle={styles.dropdownItemText}
          placeholderTextStyle={styles.placeholderText}
          placeholderTextColor={'#666'}
        />

        {selectedCollection === 'deliverydriver' && (
          <>
            <Text style={styles.label}>Assigned Van No</Text>
            <TextInput
              value={assignedVanNo}
              onChangeText={setAssignedVanNo}
              style={styles.input}
              placeholder="Enter Van No"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter Name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Transporter</Text>
            <TextInput
              value={transporter}
              onChangeText={setTransporter}
              style={styles.input}
              placeholder="Enter Transporter"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#999"
            />
          </>
        )}

        {selectedCollection === 'customer' && (
          <>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter Name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#999"
            />
          </>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save User</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  scrollContainerWeb: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  loader: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: 'orange',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topSection: {
    width: '100%',
    height: '10%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default AddUserScreen;