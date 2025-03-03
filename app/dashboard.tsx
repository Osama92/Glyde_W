// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   useWindowDimensions,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   TextInput,
//   Image
// } from 'react-native';
// import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
// import { MaterialIcons } from '@expo/vector-icons';
// import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
// import { app } from '../firebase';
// import { useRouter } from 'expo-router'; // For navigation

// const db = getFirestore(app);

// //const { width } = useWindowDimensions();
// const isMobile = 768;

// const DashboardScreen: React.FC = () => {
//   const { width } = useWindowDimensions();
//   const isMobile = width < 768;
//   const [isSidebarVisible, setSidebarVisible] = useState(!isMobile);
//   const [shipments, setShipments] = useState<any[]>([]);
//   const [deliveries, setDeliveries] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
//   const [materials, setMaterials] = useState<any[]>([]);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState(''); // For search input
//   const router = useRouter(); // Initialize router for navigation

//   // Fetch shipments and deliveries from Firebase
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch shipments
//         const shipmentQuery = query(collection(db, 'Shipment'));
//         const shipmentSnapshot = await getDocs(shipmentQuery);
//         const shipmentData = shipmentSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setShipments(shipmentData);

//         // Fetch deliveries for each shipment
//         const deliveryData: any[] = [];
//         for (const shipment of shipmentData) {
//           const deliveryQuery = query(collection(db, 'Shipment', shipment.id, 'deliveries'));
//           const deliverySnapshot = await getDocs(deliveryQuery);
//           deliverySnapshot.forEach((doc) => {
//             deliveryData.push({
//               id: doc.id,
//               shipmentId: shipment.id,
//               ...doc.data(),
//             });
//           });
//         }
//         setDeliveries(deliveryData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter deliveries based on search query
//   const filteredDeliveries = deliveries.filter((delivery) =>
//     delivery.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Calculate total number of shipments
//   const totalShipments = shipments.length;

//   // Calculate total freight cost
//   const totalFreightCost = shipments.reduce((sum, shipment) => sum + (shipment.freightCost || 0), 0);

//   // Fetch materials for a delivery
//   const fetchMaterials = async (deliveryId: string, shipmentId: string) => {
//     try {
//       const materialsQuery = query(collection(db, 'Shipment', shipmentId, 'deliveries', deliveryId, 'materials'));
//       const materialsSnapshot = await getDocs(materialsQuery);
//       const materialsData = materialsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setMaterials(materialsData);
//       setModalVisible(true); // Show the modal
//     } catch (error) {
//       console.error('Error fetching materials:', error);
//     }
//   };

//   // Calculate total quantity and weight of materials
//   const totalQuantity = materials.reduce((sum, material) => sum + (material.quantity || 0), 0);
//   const totalWeight = materials.reduce((sum, material) => sum + (material.weight || 0), 0);

//   // Map statusId to human-readable statuses
//   const getStatusText = (statusId: number) => {
//     switch (statusId) {
//       case 1:
//         return 'Loaded';
//       case 2:
//         return 'Dispatched';
//       case 3:
//         return 'In Transit';
//       case 4:
//         return 'Delivered';
//       default:
//         return 'Unknown';
//     }
//   };

//   // Get status color based on statusId
//   const getStatusColor = (statusId: number) => {
//     switch (statusId) {
//       case 1:
//         return '#FFA500'; // Orange for Loaded
//       case 2:
//         return '#007BFF'; // Blue for Dispatched
//       case 3:
//         return '#6F42C1'; // Purple for In Transit
//       case 4:
//         return '#28A745'; // Green for Delivered
//       default:
//         return '#666'; // Gray for Unknown
//     }
//   };

//   // Sample data for the graphs
//   const barData = [
//     { value: 120, label: 'Oct 30' },
//     { value: 150, label: 'Oct 31' },
//     { value: 200, label: 'Nov 01' },
//     { value: 180, label: 'Nov 02' },
//     { value: 220, label: 'Nov 03' },
//     { value: 250, label: 'Nov 04' },
//     { value: 300, label: 'Nov 05' },
//   ];

//   const lineData = [
//     { value: 120, label: 'Oct 30' },
//     { value: 150, label: 'Oct 31' },
//     { value: 200, label: 'Nov 01' },
//     { value: 180, label: 'Nov 02' },
//     { value: 220, label: 'Nov 03' },
//     { value: 250, label: 'Nov 04' },
//     { value: 300, label: 'Nov 05' },
//   ];

//   const pieData = [
//     { value: 40, color: '#FFA500', label: 'Loaded' },
//     { value: 30, color: '#007BFF', label: 'Dispatched' },
//     { value: 20, color: '#6F42C1', label: 'In Transit' },
//     { value: 10, color: '#28A745', label: 'Delivered' },
//   ];

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Hamburger Menu Button (Mobile Only) */}
//       {isMobile && (
//         <TouchableOpacity
//           style={styles.hamburgerButton}
//           onPress={() => setSidebarVisible(!isSidebarVisible)}
//         >
//           <MaterialIcons name="menu" size={24} color="#fff" />
//         </TouchableOpacity>
//       )}

//       {/* Left Sidebar */}
//       {isSidebarVisible && (
//         <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
//           <Image source={require('../assets/images/Glyde.png')} resizeMode='contain' style={{width:40, height:40}}/>
//           <View style={styles.menu}>
//             <TouchableOpacity onPress={() => router.push('/shipment')} style={styles.menuItem}>
//               <Image source={require('../assets/images/dashboard.png')} resizeMode='contain' style={{width:30, height: 30}}/>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => router.push('/cashflow')} style={styles.menuItem}>
//             <Image source={require('../assets/images/analytics.png')} resizeMode='contain' style={{width:30, height: 30}}/>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => router.push('/message')} style={styles.menuItem}>
//             <Image source={require('../assets/images/shipmentIcon.png')} resizeMode='contain' style={{width:30, height: 30}}/>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Main Content */}
//       <ScrollView style={[styles.content, isMobile && isSidebarVisible && styles.contentShifted]}>
//         {/* Search Input */}
//         <View style={styles.searchContainer}>


//         {/* Analytics Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Analytics</Text>
//           <Text style={styles.sectionSubtitle}>This data from October 30 - November 05</Text>
//           <View style={styles.analyticsGrid}>
//             <View style={styles.analyticsCard}>
//               <Text style={styles.analyticsCardTitle}>Shipment</Text>
//               <Text style={styles.analyticsCardValue}>{totalShipments}</Text>
//             </View>
//             <View style={styles.analyticsCard}>
//               <Text style={styles.analyticsCardTitle}>Freight Cost</Text>
//               <Text style={styles.analyticsCardValue}>₦{totalFreightCost.toFixed(2)}</Text>
//             </View>
//             <View style={styles.analyticsCard}>
//               <Text style={styles.analyticsCardTitle}>Message</Text>
//               <Text style={styles.analyticsCardValue}>15</Text>
//             </View>
//           </View>
//         </View>

//         {/* Charts Section */}
//         <View style={styles.chartsContainer}>
//           <View style={styles.chart}>
//             <Text style={styles.sectionTitle}>Shipment Metrics</Text>
//             <BarChart
//               data={barData}
//               barWidth={isMobile ? 30 : 40}
//               spacing={20}
//               roundedTop
//               roundedBottom
//               frontColor="#FFA500"
//               yAxisThickness={0}
//               xAxisThickness={0}
//               noOfSections={5}
//               yAxisTextStyle={{ color: '#666' }}
//               xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
//               showReferenceLine1
//               referenceLine1Position={200}
//               referenceLine1Config={{ color: 'red', dashWidth: 2, dashGap: 3 }}
//             />
//           </View>
//           <View style={styles.chart}>
//             <Text style={styles.sectionTitle}>Shipment Trends</Text>
//             <LineChart
//               data={lineData}
//               width={isMobile ? width - 40 : 300}
//               height={200}
//               color="#007BFF"
//               dataPointsColor="#007BFF"
//               dataPointsRadius={5}
//               yAxisThickness={0}
//               xAxisThickness={0}
//               noOfSections={5}
//               yAxisTextStyle={{ color: '#666' }}
//               xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
//             />
//           </View>
//         </View>

//         {/* Pie Chart Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Shipment Status</Text>
//           <PieChart
//             data={pieData}
//             radius={100}
//             innerRadius={50}
//             centerLabelComponent={() => (
//               <Text style={{ fontSize: 16, color: '#333' }}>Status</Text>
//             )}
//           />
//         </View>

//         {/* Recent Shipment Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Recent Shipment</Text>
//           <Text style={styles.sectionSubtitle}>This data from October 30 - November 05</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search by Delivery Number"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>
//           <View style={styles.table}>
//             <View style={styles.tableRow}>
//               <Text style={styles.tableHeader}>Shipment#</Text>
//               <Text style={styles.tableHeader}>Delivery#</Text>
//               <Text style={styles.tableHeader}>Customer</Text>
//               <Text style={styles.tableHeader}>Date</Text>
//               <Text style={styles.tableHeader}>Weight</Text>
//               <Text style={styles.tableHeader}>Destination</Text>
//               <Text style={styles.tableHeader}>Status</Text>
//             </View>
//             {filteredDeliveries.map((delivery, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.tableRow}
//                 onPress={() => fetchMaterials(delivery.id, delivery.shipmentId)}
//               >
//                 <Text style={styles.tableCell}>{delivery.shipmentId}</Text>
//                 <Text style={styles.tableCell}>{delivery.deliveryNumber}</Text>
//                 <Text style={styles.tableCell}>{delivery.customer}</Text>
//                 <Text style={styles.tableCell}>{delivery.createdAt}</Text>
//                 <Text style={styles.tableCell}>{delivery.weight}</Text>
//                 <Text style={styles.tableCell}>{delivery.address}</Text>
//                 <Text
//                   style={[
//                     styles.tableCell,
//                     { backgroundColor: getStatusColor(delivery.statusId), borderRadius: 5, padding: 2, color: '#fff' },
//                   ]}
//                 >
//                   {getStatusText(delivery.statusId)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Materials Modal */}
//       <Modal
//         visible={isModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Materials</Text>
//             <View style={styles.modalTable}>
//               <View style={styles.modalTableRow}>
//                 <Text style={styles.modalTableHeader}>Name</Text>
//                 <Text style={styles.modalTableHeader}>Quantity</Text>
//                 <Text style={styles.modalTableHeader}>Weight</Text>
//               </View>
//               {materials.map((material, index) => (
//                 <View key={index} style={styles.modalTableRow}>
//                   <Text style={styles.modalTableCell}>{material.name}</Text>
//                   <Text style={styles.modalTableCell}>{material.quantity}</Text>
//                   <Text style={styles.modalTableCell}>{material.weight}</Text>
//                 </View>
//               ))}
//               {/* Totals Row */}
//               <View style={styles.modalTableRow}>
//                 <Text style={styles.modalTableCell}>Total</Text>
//                 <Text style={styles.modalTableCell}>{totalQuantity}</Text>
//                 <Text style={styles.modalTableCell}>{totalWeight}</Text>
//               </View>
//             </View>
//             <Pressable
//               style={styles.modalCloseButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.modalCloseButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: '#f5f5f5',
//   },
//   sidebar: {
//     width: 90,
//     backgroundColor: '#f3f3f3',
//     padding: 20,
//   },
//   mobileSidebar: {
//     width: '100%',
//     position: 'absolute',
//     zIndex: 1,
//     height: '100%',
//   },
//   sidebarTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 20,
//   },
//   menu: {
//     marginTop: 60,
//   },
//   menuItem: {
//     marginBottom: 30,
//     width:50,
//     height:50,
//     backgroundColor:'#F9f9f9',
//     borderRadius: 5,
//     justifyContent:'center',
//     alignItems:'center'

//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   contentShifted: {
//     marginLeft: 250,
//   },
//   searchContainer: {
//     marginBottom: 20,
//   },
//   searchInput: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 10,
//     fontSize: 16,
//   },
//   section: {
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 20,
//   },
//   analyticsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   analyticsCard: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     marginRight: 10,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   analyticsCardTitle: {
//     fontSize: 16,
//     color: '#666',
//   },
//   analyticsCardValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   chartsContainer: {
//     flexDirection: isMobile ? 'column' : 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   chart: {
//     flex: 1,
//     marginRight: isMobile ? 0 : 10,
//     marginBottom: isMobile ? 20 : 0,
//   },
//   table: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems:'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   tableHeader: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//   },
//   tableCell: {
//     fontSize: 14,
//     color: '#666',
//     flex: 1,
//   },
//   hamburgerButton: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     zIndex: 2,
//     backgroundColor: '#2c3e50',
//     padding: 10,
//     borderRadius: 5,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     width: '90%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalTable: {
//     marginBottom: 20,
//   },
//   modalTableRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalTableHeader: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//   },
//   modalTableCell: {
//     fontSize: 14,
//     color: '#666',
//     flex: 1,
//   },
//   modalCloseButton: {
//     backgroundColor: '#FFA500',
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   modalCloseButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
// });

// export default DashboardScreen;






// import React, { useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
// import { Picker } from "@react-native-picker/picker";

// // Google Maps configuration
// const mapContainerStyle = {
//   width: "100%",
//   height: "33.33vh", // 1/3 of the screen height
// };

// const center = {
//   lat: 37.7749, // Default center (San Francisco)
//   lng: -122.4194,
// };

// // Transporters and vehicles data
// const transporters = {
//   "Transporter A": ["Vehicle 1", "Vehicle 2"],
//   "Transporter B": ["Vehicle 3", "Vehicle 4"],
// };

// // Shipment details (mocked data)
// const shipmentDetails = {
//   "Vehicle 1": {
//     capacity: "8.453K0",
//     status: "On-Route",
//     arrivalDate: "28.10.23",
//     type: "Household Chemicals",
//   },
//   "Vehicle 2": {
//     capacity: "7.200K0",
//     status: "Deferred",
//     arrivalDate: "29.10.23",
//     type: "Electronics",
//   },
// };

// export default function App() {
//   const [selectedTransporter, setSelectedTransporter] = useState("");
//   const [selectedVehicle, setSelectedVehicle] = useState("");
//   const [truckDetails, setTruckDetails] = useState(null);

//   // Load Google Maps script
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w", // Replace with your API key
//   });

//   // Handle transporter selection
//   const handleTransporterChange = (transporter: any) => {
//     setSelectedTransporter(transporter);
//     setSelectedVehicle("");
//     setTruckDetails(null);
//   };

//   // Handle vehicle selection
//   const handleVehicleChange = (vehicle: any) => {
//     setSelectedVehicle(vehicle);
//     setTruckDetails(shipmentDetails[vehicle]);
//   };

//   if (loadError) return <Text>Error loading maps</Text>;
//   if (!isLoaded) return <Text>Loading Maps...</Text>;

//   return (
//     <View style={styles.container}>
//       {/* Google Map */}
//       <GoogleMap
//         mapContainerStyle={mapContainerStyle}
//         zoom={10}
//         center={center}
//       >
//         <Marker position={center} />
//       </GoogleMap>

//       {/* Dropdowns for Transporter and Vehicle */}
//       <View style={styles.dropdowns}>
//         <Picker
//           selectedValue={selectedTransporter}
//           onValueChange={handleTransporterChange}
//           style={styles.picker}
//         >
//           <Picker.Item label="Select Transporter" value="" />
//           {Object.keys(transporters).map((transporter) => (
//             <Picker.Item key={transporter} label={transporter} value={transporter} />
//           ))}
//         </Picker>

//         <Picker
//           selectedValue={selectedVehicle}
//           onValueChange={handleVehicleChange}
//           enabled={!!selectedTransporter}
//           style={styles.picker}
//         >
//           <Picker.Item label="Select Vehicle" value="" />
//           {selectedTransporter &&
//             transporters[selectedTransporter].map((vehicle: any) => (
//               <Picker.Item key={vehicle} label={vehicle} value={vehicle} />
//             ))}
//         </Picker>
//       </View>

//       {/* Truck Details */}
//       {truckDetails && (
//         <View style={styles.truckDetails}>
//           <Text style={styles.detailText}>Capacity: {truckDetails.capacity}</Text>
//           <Text style={styles.detailText}>Status: {truckDetails.status}</Text>
//           <Text style={styles.detailText}>Arrival Date: {truckDetails.arrivalDate}</Text>
//           <Text style={styles.detailText}>Type: {truckDetails.type}</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   dropdowns: {
//     marginVertical: 16,
//   },
//   picker: {
//     backgroundColor: "#f0f0f0",
//     marginBottom: 16,
//   },
//   truckDetails: {
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
// });

import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Picker } from "@react-native-picker/picker";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, getDocs } from "firebase/firestore";

// Google Maps configuration
const mapContainerStyle = {
  width: "100%",
  height: "53.33vh", // 1/3 of the screen height
};

// Type definitions
interface DeliveryDriver {
  Transporter: string;
  AssignedVanNo: string;
  Latitude: number;
  Longitude: number;
}

interface Transporter {
  [key: string]: string[]; // Transporter name -> List of assigned vehicles
}

interface TruckDetails {
  capacity: string;
  status: string;
  arrivalDate: string;
  type: string;
}

export default function App() {
  const [transporters, setTransporters] = useState<Transporter>({});
  const [selectedTransporter, setSelectedTransporter] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [truckDetails, setTruckDetails] = useState<TruckDetails | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [vehicleLocation, setVehicleLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
  const [truckIcon, setTruckIcon] = useState<google.maps.Icon | null>(null); // Lazy load truck icon
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w", // Replace with your API key
  });

  // Define truck icon after Google Maps is loaded
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && window.google) {
      setTruckIcon({
        url: "https://cdn-icons-png.flaticon.com/512/2748/2748553.png", // Replace with your custom truck icon URL
        scaledSize: new window.google.maps.Size(40, 40), // Adjust size as needed
      });
    }
  }, [isLoaded]);

  // Fetch transporters and vehicles from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "deliverydriver"));
        const data: Transporter = {};

        querySnapshot.forEach((doc) => {
          const driverData = doc.data() as DeliveryDriver;
          const { Transporter, AssignedVanNo } = driverData;

          if (Transporter && AssignedVanNo) {
            if (!data[Transporter]) {
              data[Transporter] = [];
            }
            data[Transporter].push(AssignedVanNo);
          }
        });

        setTransporters(data);
      } catch (err) {
        setError("Failed to fetch data from Firebase");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          setError("Failed to fetch user location");
          console.error(err);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  // Handle transporter selection
  const handleTransporterChange = (transporter: string) => {
    setSelectedTransporter(transporter);
    setSelectedVehicle("");
    setTruckDetails(null);
    setVehicleLocation(null);
  };

  // Handle vehicle selection
  const handleVehicleChange = async (vehicle: string) => {
    setSelectedVehicle(vehicle);

    try {
      const querySnapshot = await getDocs(collection(db, "deliverydriver"));
      querySnapshot.forEach((doc) => {
        const driverData = doc.data() as DeliveryDriver;
        if (driverData.AssignedVanNo === vehicle) {
          const newLocation = {
            lat: driverData.Latitude,
            lng: driverData.Longitude,
          };

          console.log("Selected Vehicle Location:", newLocation); 
          console.log(doc.data)

          setVehicleLocation(newLocation);
          setTruckDetails({
            capacity: "8.453K0", // Example data
            status: "On-Route",
            arrivalDate: "28.10.23",
            type: "Household Chemicals",
          });

          // Animate the map to the selected vehicle's location
          if (mapRef.current) {
            console.log("Animating map to:", newLocation); // Debugging
            mapRef.current.panTo(newLocation);
          } else {
            console.error("mapRef is not set"); // Debugging
          }
        }
      });
    } catch (err) {
      console.error("Failed to fetch vehicle location:", err);
    }
  };

  if (loadError) return <Text>Error loading maps</Text>;
  if (!isLoaded || loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;

  return (
    <View style={styles.container}>
      {/* Google Map */}
      {typeof window !== "undefined" && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={userLocation || { lat: 37.7749, lng: -122.4194 }} // Fallback to default location
          onLoad={(map: google.maps.Map) => {
            console.log("Google Map loaded"); // Debugging
            mapRef.current = map;
          }}
        >
          {userLocation && <Marker position={userLocation} />}

          {/* Custom truck marker */}
          {vehicleLocation && truckIcon && (
            <Marker
              position={vehicleLocation}
              icon={truckIcon}
              onClick={() => setShowInfoWindow(true)}
            >
              {showInfoWindow && (
                <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                  <View style={styles.infoWindow}>
                    <Text style={styles.detailText}>Capacity: {truckDetails?.capacity}</Text>
                    <Text style={styles.detailText}>Status: {truckDetails?.status}</Text>
                    <Text style={styles.detailText}>Arrival Date: {truckDetails?.arrivalDate}</Text>
                    <Text style={styles.detailText}>Type: {truckDetails?.type}</Text>
                  </View>
                </InfoWindow>
              )}
            </Marker>
          )}

          {/* Dropdowns inside the map */}
          <View style={styles.dropdownContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Transporter</Text>
              <Picker
                selectedValue={selectedTransporter}
                onValueChange={handleTransporterChange}
                style={styles.picker}
              >
                <Picker.Item label="Select Transporter" value="" />
                {Object.keys(transporters).map((transporter) => (
                  <Picker.Item key={transporter} label={transporter} value={transporter} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Vehicle</Text>
              <Picker
                selectedValue={selectedVehicle}
                onValueChange={handleVehicleChange}
                enabled={!!selectedTransporter}
                style={styles.picker}
              >
                <Picker.Item label="Select Vehicle" value="" />
                {selectedTransporter &&
                  transporters[selectedTransporter].map((vehicle) => (
                    <Picker.Item key={vehicle} label={vehicle} value={vehicle} />
                  ))}
              </Picker>
            </View>
          </View>
        </GoogleMap>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dropdownContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  picker: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  infoWindow: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
});