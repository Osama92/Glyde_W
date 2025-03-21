// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
// import RNPickerSelect from 'react-native-picker-select';
// import { app } from '../firebase';

// const db = getFirestore(app);

// const collections = [
//   { id: 'deliverydriver', name: 'Delivery Driver' },
//   { id: 'customer', name: 'Customer' },
//   { id: 'transporter', name: 'Transporter' },
//   { id: 'fieldagent', name: 'Field Agent' },
// ];

// const AddUserScreen: React.FC = () => {
//   const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
//   const [assignedVanNo, setAssignedVanNo] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [name, setName] = useState('');
//   const [transporter, setTransporter] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [transporters, setTransporters] = useState<{ label: string; value: string }[]>([]);
//   const [fetchingTransporters, setFetchingTransporters] = useState(false);

//   const { width } = Dimensions.get('window');
//   const isWeb = width >= 768;

//   // Fetch transporters from Firebase
//   useEffect(() => {
//     const fetchTransporters = async () => {
//       setFetchingTransporters(true);
//       try {
//         const transporterRef = collection(db, 'transporter');
//         const transporterSnapshot = await getDocs(transporterRef);
//         const transporterData = transporterSnapshot.docs.map((doc) => ({
//           label: doc.data().name, // Assuming 'name' is the field in the transporter collection
//           value: doc.id, // Use the document ID as the value
//         }));
//         setTransporters(transporterData);
//       } catch (error) {
//         console.error('Error fetching transporters:', error);
//         showAlert('Error', 'Failed to fetch transporters');
//       } finally {
//         setFetchingTransporters(false);
//       }
//     };

//     if (selectedCollection === 'deliverydriver') {
//       fetchTransporters();
//     }
//   }, [selectedCollection]);

//   const showAlert = (title: string, message: string) => {
//     if (isWeb) {
//       window.alert(`${title}: ${message}`);
//     } else {
//       alert(`${title}: ${message}`);
//     }
//   };

//   const handleSave = async () => {
//     if (!selectedCollection) {
//       showAlert('Error', 'Please select a collection');
//       return;
//     }

//     if (
//       selectedCollection === 'deliverydriver' &&
//       (!phoneNumber || !name || !assignedVanNo || !transporter || !password)
//     ) {
//       showAlert('Error', 'All fields are required for Delivery Driver');
//       return;
//     }

//     if (selectedCollection === 'customer' && (!phoneNumber || !name || !password)) {
//       showAlert('Error', 'All fields are required for Customer');
//       return;
//     }

//     const uid = `${phoneNumber}_${name}`;
//     const userData: Record<string, any> = { uid };

//     if (selectedCollection === 'deliverydriver') {
//       Object.assign(userData, {
//         AssignedVanNo: assignedVanNo,
//         phoneNumber,
//         name,
//         Transporter: transporter,
//         password,
//       });
//     } else if (selectedCollection === 'customer') {
//       Object.assign(userData, {
//         phoneNumber,
//         name,
//         password,
//       });
//     } else if (selectedCollection === 'transporter') {
//       Object.assign(userData, {
//         phoneNumber,
//         name,
//         password,
//       });
//     } else if (selectedCollection === 'fieldagent') {
//       Object.assign(userData, {
//         phoneNumber,
//         name,
//         password,
//       });
//     }

//     setIsLoading(true);
//     try {
//       await setDoc(doc(db, selectedCollection, uid), userData);
//       showAlert('Success', 'User added successfully');
//     } catch (error) {
//       showAlert('Error', 'Failed to add user');
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <ScrollView contentContainerStyle={[styles.scrollContainer, isWeb && styles.scrollContainerWeb]}>
//         <Text style={styles.label}>Select a Access to create</Text>
//         <RNPickerSelect
//           onValueChange={(value) => setSelectedCollection(value)}
//           items={collections.map((item) => ({
//             label: item.name,
//             value: item.id,
//           }))}
//           placeholder={{ label: 'Select Category..', value: null }}
//           style={{
//             inputIOS: styles.input,
//             inputAndroid: styles.input,
//             inputWeb: {
//               padding: 12,
//               marginBottom: 16,
//               borderWidth: 1,
//               borderColor: '#ddd',
//               borderRadius: 8,
//               backgroundColor: '#fff',
//               height: 50,
//             },
//           }}
//         />

//         {selectedCollection === 'deliverydriver' && (
//           <>
//             <Text style={styles.label}>Assigned Van Number</Text>
//             <TextInput
//               value={assignedVanNo}
//               onChangeText={setAssignedVanNo}
//               style={styles.input}
//               placeholder="Enter Van No."
//             />
//             <Text style={styles.label}>Phone Number</Text>
//             <TextInput
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//               style={styles.input}
//               placeholder="Enter Phone Number"
//             />
//             <Text style={styles.label}>Driver Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//               placeholder="Enter Name"
//             />
//             <Text style={styles.label}>Transporter</Text>
//             {fetchingTransporters ? (
//               <ActivityIndicator size="small" color="orange" />
//             ) : (
//               <RNPickerSelect
//                 onValueChange={(value) => setTransporter(value)}
//                 items={transporters}
//                 placeholder={{ label: 'Select Transporter', value: null }}
//                 style={{
//                   inputIOS: styles.input,
//                   inputAndroid: styles.input,
//                   inputWeb: {
//                     padding: 12,
//                     marginBottom: 16,
//                     borderWidth: 1,
//                     borderColor: '#ddd',
//                     borderRadius: 8,
//                     backgroundColor: '#fff',
//                     height: 50,
//                   },
//                 }}
//               />
//             )}
//             <Text style={styles.label}>Password</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//               style={styles.input}
//               placeholder="Enter a Default Password"
//             />
//           </>
//         )}

//         {selectedCollection === 'customer' && (
//           <>
//             <Text style={styles.label}>Phone Number</Text>
//             <TextInput
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//               style={styles.input}
//               placeholder="Enter Phone Number"
//             />
//             <Text style={styles.label}>Customer Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//               placeholder="Enter Customer/ Business Name"
//             />
//             <Text style={styles.label}>Password</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//               style={styles.input}
//               placeholder="Enter a Default Password"
//             />
//           </>
//         )}

//         {selectedCollection === 'transporter' && (
//           <>
//             <Text style={styles.label}>Phone Number</Text>
//             <TextInput
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//               style={styles.input}
//               placeholder="Enter Phone Number"
//             />
//             <Text style={styles.label}>Transporter Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//               placeholder="Enter Transporter/ Business Name"
//             />
//             <Text style={styles.label}>Password</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//               style={styles.input}
//               placeholder="Enter a Default Password"
//             />
//           </>
//         )}

//         {selectedCollection === 'fieldagent' && (
//           <>
//             <Text style={styles.label}>Phone Number</Text>
//             <TextInput
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               keyboardType="phone-pad"
//               style={styles.input}
//               placeholder="Enter Phone Number"
//             />
//             <Text style={styles.label}>Agent Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               style={styles.input}
//               placeholder="Enter Agent Name"
//             />
//             <Text style={styles.label}>Password</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//               style={styles.input}
//               placeholder="Enter a Default Password"
//             />
//           </>
//         )}

//         {isLoading ? (
//           <ActivityIndicator size="large" color="orange" style={styles.loader} />
//         ) : (
//           <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//             <Text style={styles.saveButtonText}>Save User</Text>
//           </TouchableOpacity>
//         )}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   scrollContainer: { padding: 20 },
//   scrollContainerWeb: { maxWidth: 600, alignSelf: 'center', width: '100%' },
//   label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
//   input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
//   loader: { marginTop: 20 },
//   saveButton: { backgroundColor: 'orange', borderRadius: 8, padding: 16, alignItems: 'center' },
//   saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// });

// export default AddUserScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import RNPickerSelect from 'react-native-picker-select';
import { app } from '../firebase';

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
  const [transporters, setTransporters] = useState<{ label: string; value: string }[]>([]);
  const [fetchingTransporters, setFetchingTransporters] = useState(false);

  const { width } = Dimensions.get('window');
  const isWeb = width >= 768;

  // Fetch transporters from Firebase
  useEffect(() => {
    const fetchTransporters = async () => {
      setFetchingTransporters(true);
      try {
        const transporterRef = collection(db, 'transporter');
        const transporterSnapshot = await getDocs(transporterRef);
        const transporterData = transporterSnapshot.docs.map((doc) => ({
          label: doc.data().name, // Assuming 'name' is the field in the transporter collection
          value: doc.id, // Use the document ID as the value
        }));
        setTransporters(transporterData);
      } catch (error) {
        console.error('Error fetching transporters:', error);
        showAlert('Error', 'Failed to fetch transporters');
      } finally {
        setFetchingTransporters(false);
      }
    };

    if (selectedCollection === 'deliverydriver') {
      fetchTransporters();
    }
  }, [selectedCollection]);

  const showAlert = (title: string, message: string) => {
    if (isWeb) {
      window.alert(`${title}: ${message}`);
    } else {
      alert(`${title}: ${message}`);
    }
  };

  const handleSave = async () => {
    if (!selectedCollection) {
      showAlert('Error', 'Please select a collection');
      return;
    }

    if (
      selectedCollection === 'deliverydriver' &&
      (!phoneNumber || !name || !assignedVanNo || !transporter || !password)
    ) {
      showAlert('Error', 'All fields are required for Delivery Driver');
      return;
    }

    if (selectedCollection === 'customer' && (!phoneNumber || !name || !password)) {
      showAlert('Error', 'All fields are required for Customer');
      return;
    }

    const uid = `${phoneNumber}_${name}`;
    const userData: Record<string, any> = { uid };

    if (selectedCollection === 'deliverydriver') {
      Object.assign(userData, {
        AssignedVanNo: assignedVanNo,
        phoneNumber,
        name,
        Transporter: transporter,
        password,
      });
    } else if (selectedCollection === 'customer') {
      Object.assign(userData, {
        phoneNumber,
        name,
        password,
      });
    } else if (selectedCollection === 'transporter') {
      Object.assign(userData, {
        phoneNumber,
        name,
        password,
      });
    } else if (selectedCollection === 'fieldagent') {
      Object.assign(userData, {
        phoneNumber,
        name,
        password,
      });
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, selectedCollection, uid), userData);
      showAlert('Success', 'User added successfully');
    } catch (error) {
      showAlert('Error', 'Failed to add user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.mainContainer}>
        {/* Left Side Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/guy1.png')} // Replace with your image path
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Right Side Form */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Add New User</Text>
          <Text style={styles.label}>Select Access Level</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedCollection(value)}
            items={collections.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            placeholder={{ label: 'Select Category..', value: null }}
            style={pickerSelectStyles}
          />

          {selectedCollection === 'deliverydriver' && (
            <>
              <Text style={styles.label}>Assigned Van Number</Text>
              <TextInput
                value={assignedVanNo}
                onChangeText={setAssignedVanNo}
                style={styles.input}
                placeholder="Enter Van No."
              />
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Enter Phone Number"
              />
              <Text style={styles.label}>Driver Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter Name"
              />
              <Text style={styles.label}>Transporter</Text>
              {fetchingTransporters ? (
                <ActivityIndicator size="small" color="orange" />
              ) : (
                <RNPickerSelect
                  onValueChange={(value) => setTransporter(value)}
                  items={transporters}
                  placeholder={{ label: 'Select Transporter', value: null }}
                  style={pickerSelectStyles}
                />
              )}
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="Enter a Default Password"
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
              />
              <Text style={styles.label}>Customer Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter Customer/ Business Name"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="Enter a Default Password"
              />
            </>
          )}

          {selectedCollection === 'transporter' && (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Enter Phone Number"
              />
              <Text style={styles.label}>Transporter Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter Transporter/ Business Name"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="Enter a Default Password"
              />
            </>
          )}

          {selectedCollection === 'fieldagent' && (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Enter Phone Number"
              />
              <Text style={styles.label}>Agent Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter Agent Name"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="Enter a Default Password"
              />
            </>
          )}

          {isLoading ? (
            <ActivityIndicator size="large" color="orange" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save User</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mainContainer: { flex: 1, flexDirection: 'row' },
  imageContainer: { flex: 1, backgroundColor: '#000' },
  image: { width: '100%', height: '100%', backgroundColor:'#fff' },
  scrollContainer: { flex: 2, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  loader: { marginTop: 20 },
  saveButton: {
    backgroundColor: 'orange',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
});

export default AddUserScreen;