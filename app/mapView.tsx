// import React, { useState, useEffect, useRef } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../firebase"; 
// import { collection, onSnapshot, query, where } from "firebase/firestore";

// // Google Maps configuration
// const mapContainerStyle = {
//   width: "100%",
//   height: "53.33vh",
//   borderRadius: 20
// };

// // Type definitions
// interface DeliveryDriver {
//   Transporter: string;
//   AssignedVanNo: string;
//   Latitude: number;
//   Longitude: number;
// }

// interface Delivery {
//   id: string;
//   customer: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   statusId: number;
// }

// interface Transporter {
//   [key: string]: string[]; 
// }

// interface TruckDetails {
//   VehicleNumber: string;
//   status: string;
//   arrivalDate: string;
//   type: string;
// }

// interface MapView {
//   onVehicleSelect: (vehicle: string) => void;
// }

// export default function MapView({ onVehicleSelect }: MapView) {
//   const [transporters, setTransporters] = useState<Transporter>({});
//   const [selectedTransporter, setSelectedTransporter] = useState<string>("");
//   const [selectedVehicle, setSelectedVehicle] = useState<string>("");
//   const [truckDetails, setTruckDetails] = useState<TruckDetails | null>(null);
//   const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");
//   const [vehicleLocation, setVehicleLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
//   const [truckIcon, setTruckIcon] = useState<google.maps.Icon | null>(null); // Lazy load truck icon
//   const [deliveryLocations, setDeliveryLocations] = useState<Delivery[]>([]);
//   const mapRef = useRef<google.maps.Map | null>(null);

//   // Load Google Maps script
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w", // Replace with your API key
//   });

//   // Define truck icon after Google Maps is loaded
//   useEffect(() => {
//     if (isLoaded && typeof window !== "undefined" && window.google) {
//       setTruckIcon({
//         url: "https://media-hosting.imagekit.io//1a118ca7b95548d4/cargo-truck.png?Expires=1835626184&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uJ27jI4pZWFJ6hZmvUQWSB0VzZTdPC44exADDDxjz4UT8jX7leZIHDbxbFjROnNYJZlFeFUb68RvZ-P4hu7E9V~TtUWy67r5hWov1285odXla1tHZPxVz~RmRwX03gtf6xgAlR~5EWoTAQoiHAcwiXvpqRJmw9QBQt7Oxlb2pyQg5qWpXN72Fx6zXFAENFavRwD20BGelhq2MoMAvaV-1XLYJtsNfJjWF~3RkmGf29HNeEcywk7wOPmvJEg2hpF3vTCoHSHVKO~fbQnS1qMvWkYeHHkTbVj4yNdL68qrQ0vazMEr~PGxJ~9haMwCrTHyIxip9cfiJ-yNwG8MRb-Dgg__", 
//         scaledSize: new window.google.maps.Size(50, 50), // Adjust size as needed
//       });
//     }
//   }, [isLoaded]);

//   // Fetch transporters and vehicles from Firebase (real-time)
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "deliverydriver"), (querySnapshot) => {
//       const data: Transporter = {};

//       querySnapshot.forEach((doc) => {
//         const driverData = doc.data() as DeliveryDriver;
//         const { Transporter, AssignedVanNo } = driverData;

//         if (Transporter && AssignedVanNo) {
//           if (!data[Transporter]) {
//             data[Transporter] = [];
//           }
//           data[Transporter].push(AssignedVanNo);
//         }
//       });

//       setTransporters(data);
//     });

//     // Cleanup listener on unmount
//     return () => unsubscribe();
//   }, []);

//   // Get user's current location
//   useEffect(() => {
//     if (typeof window !== "undefined" && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//           setLoading(false);
//         },
//         (err) => {
//           setError("Failed to fetch user location");
//           console.error(err);
//           setLoading(false);
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser");
//       setLoading(false);
//     }
//   }, []);

//   // Handle transporter selection
//   const handleTransporterChange = (transporter: string) => {
//     setSelectedTransporter(transporter);
//     setSelectedVehicle("");
//     setTruckDetails(null);
//     setVehicleLocation(null);
//   };

//   // Handle vehicle selection (real-time updates)
//   useEffect(() => {
//     if (selectedVehicle) {
//       onVehicleSelect(selectedVehicle);
//       const q = query(collection(db, "deliverydriver"), where("AssignedVanNo", "==", selectedVehicle));

//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//           const driverData = doc.data() as DeliveryDriver;
//           const newLocation = {
//             lat: driverData.Latitude,
//             lng: driverData.Longitude,
//           };

//           //console.log("Selected Vehicle Location (Real-Time):", newLocation);

//           setVehicleLocation(newLocation);
//           setTruckDetails({
//             VehicleNumber: selectedVehicle,
//             status: "On-Route",
//             arrivalDate: "28.10.23",
//             type: "Household Chemicals",
//           });

//           // Animate the map to the selected vehicle's location
//           if (mapRef.current) {
//             console.log("Animating map to:", newLocation);
//             mapRef.current.panTo(newLocation);
//           } else {
//             console.error("mapRef is not set");
//           }
//         });
//       });

//       // Cleanup listener on unmount or when vehicle changes
//       return () => unsubscribe();
//     }
//   }, [selectedVehicle, onVehicleSelect]);

//   // Fetch delivery locations for the selected vehicle
//   useEffect(() => {
//     if (selectedVehicle) {
//       const deliveriesQuery = query(collection(db, "Shipment"), where("vehicleNo", "==", selectedVehicle));
//       const unsubscribe = onSnapshot(deliveriesQuery, (querySnapshot) => {
//         const deliveries: Delivery[] = querySnapshot.docs
//           .map((doc) => ({
//             id: doc.id,
//             customer: doc.data().customer,
//             address: doc.data().address,
//             latitude: doc.data().latitude,
//             longitude: doc.data().longitude,
//             statusId: doc.data().statusId,
//           }))
//           .filter((delivery) => delivery.statusId !== 4); // Filter out completed deliveries

//         setDeliveryLocations(deliveries);
//         console.log("Delivery Locations:", deliveries);
//       });

//       return () => unsubscribe();
//     }
//   }, [selectedVehicle]);

//   if (loadError) return <Text>Error loading maps</Text>;
//   if (!isLoaded || loading) return <Text>Loading...</Text>;
//   if (error) return <Text>{error}</Text>;

//   return (
//     <View style={styles.container}>
//       {/* Google Map */}
//       {typeof window !== "undefined" && (
//         <GoogleMap
//           mapContainerStyle={mapContainerStyle}
//           zoom={15}
//           center={userLocation || { lat: 37.7749, lng: -122.4194 }} // Fallback to default location
//           onLoad={(map: google.maps.Map) => {
//             console.log("Google Map loaded");
//             mapRef.current = map;
//           }}
//         >
//           {userLocation && <Marker position={userLocation} />}

//           {/* Custom truck marker */}
//           {vehicleLocation && truckIcon && (
//             <Marker
//               position={vehicleLocation}
//               icon={truckIcon}
//               onClick={() => setShowInfoWindow(true)}
//             >
//               {showInfoWindow && (
//                 <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
//                   <View style={styles.infoWindow}>
//                     <Text style={styles.detailText}>Truck Number: {truckDetails?.VehicleNumber}</Text>
//                   </View>
//                 </InfoWindow>
//               )}
//             </Marker>
//           )}

//           {/* Delivery location markers */}
//           {deliveryLocations.map((delivery, index) => (
//             <Marker
//               key={delivery.id}
//               position={{ lat: delivery.latitude, lng: delivery.longitude }}
//               label={`${index + 1}`} // Display sequence number
//               labelStyle={{ color: "white", fontWeight: "bold" }}
//             />
//           ))}

//           {/* Dropdowns inside the map */}
//           <View style={styles.dropdownContainer}>
//             <View style={styles.pickerContainer}>
//               <Text style={styles.label}>Select Transporter</Text>
//               <Picker
//                 selectedValue={selectedTransporter}
//                 onValueChange={handleTransporterChange}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Select Transporter" value="" />
//                 {Object.keys(transporters).map((transporter) => (
//                   <Picker.Item key={transporter} label={transporter} value={transporter} />
//                 ))}
//               </Picker>
//             </View>

//             <View style={styles.pickerContainer}>
//               <Text style={styles.label}>Select Vehicle</Text>
//               <Picker
//                 selectedValue={selectedVehicle}
//                 onValueChange={(vehicle) => setSelectedVehicle(vehicle)}
//                 enabled={!!selectedTransporter}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Select Vehicle" value="" />
//                 {selectedTransporter &&
//                   transporters[selectedTransporter].map((vehicle) => (
//                     <Picker.Item key={vehicle} label={vehicle} value={vehicle} />
//                   ))}
//               </Picker>
//             </View>
//           </View>
//         </GoogleMap>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   dropdownContainer: {
//     position: "absolute",
//     flexDirection: "row",
//     top: 16,
//     left: 16,
//     right: 16,
//     backgroundColor: "#343131",
//     borderRadius: 8,
//     padding: 16,
//     width: 380,
//   },
//   pickerContainer: {
//     marginBottom: 16,
//     marginRight: 40,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "#fff",
//   },
//   picker: {
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     width: 150,
//     height: 30,
//   },
//   infoWindow: {
//     padding: 8,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//   },
//   detailText: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
// });






// import React, { useState, useEffect, useRef } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../firebase"; 
// import { collection, onSnapshot, query, where } from "firebase/firestore";

// // Google Maps configuration
// const mapContainerStyle = {
//   width: "100%",
//   height: "53.33vh",
//   borderRadius: 20
// };

// // Type definitions
// interface DeliveryDriver {
//   Transporter: string;
//   AssignedVanNo: string;
//   Latitude: number;
//   Longitude: number;
// }

// interface Delivery {
//   id: string;
//   customer: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   statusId: number;
// }

// interface Transporter {
//   [key: string]: string[]; 
// }

// interface TruckDetails {
//   VehicleNumber: string;
//   status: string;
//   arrivalDate: string;
//   type: string;
// }

// interface MapView {
//   onVehicleSelect: (vehicle: string) => void;
// }

// export default function MapView({ onVehicleSelect }: MapView) {
//   const [transporters, setTransporters] = useState<Transporter>({});
//   const [selectedTransporter, setSelectedTransporter] = useState<string>("");
//   const [selectedVehicle, setSelectedVehicle] = useState<string>("");
//   const [truckDetails, setTruckDetails] = useState<TruckDetails | null>(null);
//   const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");
//   const [vehicleLocation, setVehicleLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
//   const [truckIcon, setTruckIcon] = useState<google.maps.Icon | null>(null); // Lazy load truck icon
//   const [deliveryLocations, setDeliveryLocations] = useState<Delivery[]>([]);
//   const mapRef = useRef<google.maps.Map | null>(null);

//   // Load Google Maps script
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w", // Replace with your API key
//   });

//   // Define truck icon after Google Maps is loaded
//   useEffect(() => {
//     if (isLoaded && typeof window !== "undefined" && window.google) {
//       setTruckIcon({
//         url: "https://media-hosting.imagekit.io//1a118ca7b95548d4/cargo-truck.png?Expires=1835626184&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uJ27jI4pZWFJ6hZmvUQWSB0VzZTdPC44exADDDxjz4UT8jX7leZIHDbxbFjROnNYJZlFeFUb68RvZ-P4hu7E9V~TtUWy67r5hWov1285odXla1tHZPxVz~RmRwX03gtf6xgAlR~5EWoTAQoiHAcwiXvpqRJmw9QBQt7Oxlb2pyQg5qWpXN72Fx6zXFAENFavRwD20BGelhq2MoMAvaV-1XLYJtsNfJjWF~3RkmGf29HNeEcywk7wOPmvJEg2hpF3vTCoHSHVKO~fbQnS1qMvWkYeHHkTbVj4yNdL68qrQ0vazMEr~PGxJ~9haMwCrTHyIxip9cfiJ-yNwG8MRb-Dgg__", 
//         scaledSize: new window.google.maps.Size(50, 50), // Adjust size as needed
//       });
//     }
//   }, [isLoaded]);

//   // Fetch transporters and vehicles from Firebase (real-time)
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "deliverydriver"), (querySnapshot) => {
//       const data: Transporter = {};

//       querySnapshot.forEach((doc) => {
//         const driverData = doc.data() as DeliveryDriver;
//         const { Transporter, AssignedVanNo } = driverData;

//         if (Transporter && AssignedVanNo) {
//           if (!data[Transporter]) {
//             data[Transporter] = [];
//           }
//           data[Transporter].push(AssignedVanNo);
//         }
//       });

//       setTransporters(data);
//     });

//     // Cleanup listener on unmount
//     return () => unsubscribe();
//   }, []);

//   // Get user's current location
//   useEffect(() => {
//     if (typeof window !== "undefined" && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//           setLoading(false);
//         },
//         (err) => {
//           setError("Failed to fetch user location");
//           console.error(err);
//           setLoading(false);
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser");
//       setLoading(false);
//     }
//   }, []);

//   // Handle transporter selection
//   const handleTransporterChange = (transporter: string) => {
//     setSelectedTransporter(transporter);
//     setSelectedVehicle("");
//     setTruckDetails(null);
//     setVehicleLocation(null);
//   };

//   // Handle vehicle selection (real-time updates)
//   useEffect(() => {
//     if (selectedVehicle) {
//       onVehicleSelect(selectedVehicle);
//       const q = query(collection(db, "deliverydriver"), where("AssignedVanNo", "==", selectedVehicle));

//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//           const driverData = doc.data() as DeliveryDriver;
//           const newLocation = {
//             lat: driverData.Latitude,
//             lng: driverData.Longitude,
//           };

//           setVehicleLocation(newLocation);
//           setTruckDetails({
//             VehicleNumber: selectedVehicle,
//             status: "On-Route",
//             arrivalDate: "28.10.23",
//             type: "Household Chemicals",
//           });

//           // Animate the map to the selected vehicle's location
//           if (mapRef.current) {
//             mapRef.current.panTo(newLocation);
//           }
//         });
//       });

//       // Cleanup listener on unmount or when vehicle changes
//       return () => unsubscribe();
//     }
//   }, [selectedVehicle, onVehicleSelect]);

//   // Fetch delivery locations for the selected vehicle
//   useEffect(() => {
//     if (selectedVehicle) {
//       const deliveriesQuery = query(collection(db, "Shipment"), where("vehicleNo", "==", selectedVehicle));
//       const unsubscribe = onSnapshot(deliveriesQuery, (querySnapshot) => {
//         const deliveries: Delivery[] = [];
//         querySnapshot.forEach((shipmentDoc) => {
//           const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
//           const deliveriesSubcollectionQuery = query(deliveriesRef);
//           onSnapshot(deliveriesSubcollectionQuery, (deliveriesSnapshot) => {
//             deliveriesSnapshot.forEach((deliveryDoc) => {
//               const data = deliveryDoc.data();
//               if (data.latitude && data.longitude) {
//                 deliveries.push({
//                   id: deliveryDoc.id,
//                   customer: data.customer,
//                   address: data.address,
//                   latitude: data.latitude,
//                   longitude: data.longitude,
//                   statusId: data.statusId,
//                 });
//               }
//             });
//             setDeliveryLocations(deliveries);
//             console.log("Delivery Locations:", deliveries);
//           });
//         });
//       });

//       return () => unsubscribe();
//     }
//   }, [selectedVehicle]);

//   if (loadError) return <Text>Error loading maps</Text>;
//   if (!isLoaded || loading) return <Text>Loading...</Text>;
//   if (error) return <Text>{error}</Text>;

//   return (
//     <View style={styles.container}>
//       {/* Google Map */}
//       {typeof window !== "undefined" && (
//         <GoogleMap
//           mapContainerStyle={mapContainerStyle}
//           zoom={15}
//           center={userLocation || { lat: 37.7749, lng: -122.4194 }} // Fallback to default location
//           onLoad={(map: google.maps.Map) => {
//             mapRef.current = map;
//           }}
//         >
//           {userLocation && <Marker position={userLocation} />}

//           {/* Custom truck marker */}
//           {vehicleLocation && truckIcon && (
//             <Marker
//               position={vehicleLocation}
//               icon={truckIcon}
//               onClick={() => setShowInfoWindow(true)}
//             >
//               {showInfoWindow && (
//                 <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
//                   <View style={styles.infoWindow}>
//                     <Text style={styles.detailText}>Truck Number: {truckDetails?.VehicleNumber}</Text>
//                   </View>
//                 </InfoWindow>
//               )}
//             </Marker>
//           )}

//           {/* Delivery location markers */}
//           {deliveryLocations.map((delivery, index) => (
//             <Marker
//               key={delivery.id}
//               position={{ lat: delivery.latitude, lng: delivery.longitude }}
//               label={`${index + 1}`} // Display sequence number
//             />
//           ))}

//           {/* Dropdowns inside the map */}
//           <View style={styles.dropdownContainer}>
//             <View style={styles.pickerContainer}>
//               <Text style={styles.label}>Select Transporter</Text>
//               <Picker
//                 selectedValue={selectedTransporter}
//                 onValueChange={handleTransporterChange}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Select Transporter" value="" />
//                 {Object.keys(transporters).map((transporter) => (
//                   <Picker.Item key={transporter} label={transporter} value={transporter} />
//                 ))}
//               </Picker>
//             </View>

//             <View style={styles.pickerContainer}>
//               <Text style={styles.label}>Select Vehicle</Text>
//               <Picker
//                 selectedValue={selectedVehicle}
//                 onValueChange={(vehicle) => setSelectedVehicle(vehicle)}
//                 enabled={!!selectedTransporter}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Select Vehicle" value="" />
//                 {selectedTransporter &&
//                   transporters[selectedTransporter].map((vehicle) => (
//                     <Picker.Item key={vehicle} label={vehicle} value={vehicle} />
//                   ))}
//               </Picker>
//             </View>
//           </View>
//         </GoogleMap>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   dropdownContainer: {
//     position: "absolute",
//     flexDirection: "row",
//     top: 16,
//     left: 16,
//     right: 16,
//     backgroundColor: "#343131",
//     borderRadius: 8,
//     padding: 16,
//     width: 380,
//   },
//   pickerContainer: {
//     marginBottom: 16,
//     marginRight: 40,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "#fff",
//   },
//   picker: {
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     width: 150,
//     height: 30,
//   },
//   infoWindow: {
//     padding: 8,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//   },
//   detailText: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
// });



import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Picker } from "@react-native-picker/picker";
import { db } from "../firebase"; 
import { collection, onSnapshot, query, where } from "firebase/firestore";

// Google Maps configuration
const mapContainerStyle = {
  width: "100%",
  height: "53.33vh",
  borderRadius: 20
};

// Image URLs for custom markers
const pendingMarkerUrl = "https://media-hosting.imagekit.io//cdda70fa425445c2/down.png?Expires=1837094901&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=aujscZnYNUnr2EJ9KFGnU~9tZX83jtU3-JTU~Gk3j3GigFY7nuCZ8pFVo-skDXviWiDIseEG8YhFCAPu6yStDaUAcJC~lJR~vKmJlWlWb-EmOcSAGPwKsj1Pn5Ts94y6hZQv11kXY8ql4nMrpiW8vHo~hQLVqc-Rt7dRBzzVg2mE-eYwRXiOiw7r6cg55omw6lAhxJFNsNuQz9b9eZPb7cEdfSG0EF~d0gntjNLOxg-5pvdQTZFcBw-mXbk2HdqwDqrvopXLxGzsFAgTBHqip2Ugvoviv2ZV1L5GHz3c-xBcdarjozSOjq7gomh4q8h1MNp2gpzQZHEHfec8M~smGg__"; // Replace with your URL
const completedMarkerUrl = "https://media-hosting.imagekit.io//3643366db9af4a84/arrowDown.png?Expires=1837094796&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=tyl6RMxGp~o7ZMhzH56nTR2ZD-q1uGJl6XHqPsGKbB5p~oTBBlh755uTeeiWntMUpJ3LqPk1i-vDIOeEUIbWFXH3nNdFUTdZkaYvGNTC1dX4R8~vNx0ca2ZbjaDY5IFd8KRD5Q75c3yt1vgaKxyBgYBDmZAbH-jsmgK-iS4Y7DZKek~mz2mdrNMkjBLj~BQSLo40tH2rsy2K6R1zPKnDUeDn8GHPHP8~W2XtyJM1myBWjWBvqVK1uhDM6H5gPrRKIRZEUwOfCFGjUOnHH3PCvs5nRbXzpKpg2fipdQvu0zJyskemYv9X6GiSYhjTgnpxt7mD3cq6vwas~Co5QpmA4w__"; // Replace with your URL

// Function to get marker icon based on statusId
const getMarkerIcon = (statusId: number): google.maps.Icon => {
  return {
    url: statusId === 4 ? completedMarkerUrl : pendingMarkerUrl, // Use completed marker for statusId 4
    scaledSize: new window.google.maps.Size(40, 50), // Adjust size as needed
  };
};

// Type definitions
interface DeliveryDriver {
  Transporter: string;
  AssignedVanNo: string;
  Latitude: number;
  Longitude: number;
}

interface Delivery {
  id: string;
  customer: string;
  address: string;
  latitude: number;
  longitude: number;
  statusId: number;
}

interface Transporter {
  [key: string]: string[]; 
}

interface TruckDetails {
  VehicleNumber: string;
  status: string;
  arrivalDate: string;
  type: string;
}

interface MapView {
  onVehicleSelect: (vehicle: string) => void;
}

export default function MapView({ onVehicleSelect }: MapView) {
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
  const [deliveryLocations, setDeliveryLocations] = useState<Delivery[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Delivery | null>(null)

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyC0pSSZzkwCu4hftcE7GoSAF2DxKjW3B6w", // Replace with your API key
  });

  // Define truck icon after Google Maps is loaded
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && window.google) {
      setTruckIcon({
        url: "https://media-hosting.imagekit.io//1a118ca7b95548d4/cargo-truck.png?Expires=1835626184&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uJ27jI4pZWFJ6hZmvUQWSB0VzZTdPC44exADDDxjz4UT8jX7leZIHDbxbFjROnNYJZlFeFUb68RvZ-P4hu7E9V~TtUWy67r5hWov1285odXla1tHZPxVz~RmRwX03gtf6xgAlR~5EWoTAQoiHAcwiXvpqRJmw9QBQt7Oxlb2pyQg5qWpXN72Fx6zXFAENFavRwD20BGelhq2MoMAvaV-1XLYJtsNfJjWF~3RkmGf29HNeEcywk7wOPmvJEg2hpF3vTCoHSHVKO~fbQnS1qMvWkYeHHkTbVj4yNdL68qrQ0vazMEr~PGxJ~9haMwCrTHyIxip9cfiJ-yNwG8MRb-Dgg__", 
        scaledSize: new window.google.maps.Size(50, 50), // Adjust size as needed
      });
    }
  }, [isLoaded]);

  // Fetch transporters and vehicles from Firebase (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "deliverydriver"), (querySnapshot) => {
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
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
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

  // Handle vehicle selection (real-time updates)
  useEffect(() => {
    if (selectedVehicle) {
      onVehicleSelect(selectedVehicle);
      const q = query(collection(db, "deliverydriver"), where("AssignedVanNo", "==", selectedVehicle));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const driverData = doc.data() as DeliveryDriver;
          const newLocation = {
            lat: driverData.Latitude,
            lng: driverData.Longitude,
          };

          setVehicleLocation(newLocation);
          setTruckDetails({
            VehicleNumber: selectedVehicle,
            status: "On-Route",
            arrivalDate: "28.10.23",
            type: "Household Chemicals",
          });

          // Animate the map to the selected vehicle's location
          if (mapRef.current) {
            mapRef.current.panTo(newLocation);
          }
        });
      });

      // Cleanup listener on unmount or when vehicle changes
      return () => unsubscribe();
    }
  }, [selectedVehicle, onVehicleSelect]);

  // Fetch delivery locations for the selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      const deliveriesQuery = query(collection(db, "Shipment"), where("vehicleNo", "==", selectedVehicle));
      const unsubscribe = onSnapshot(deliveriesQuery, (querySnapshot) => {
        const deliveries: Delivery[] = [];
        querySnapshot.forEach((shipmentDoc) => {
          const deliveriesRef = collection(db, "Shipment", shipmentDoc.id, "deliveries");
          const deliveriesSubcollectionQuery = query(deliveriesRef);
          onSnapshot(deliveriesSubcollectionQuery, (deliveriesSnapshot) => {
            deliveriesSnapshot.forEach((deliveryDoc) => {
              const data = deliveryDoc.data();
              if (data.latitude && data.longitude) {
                deliveries.push({
                  id: deliveryDoc.id,
                  customer: data.customer,
                  address: data.address,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  statusId: data.statusId,
                });
              }
            });
            setDeliveryLocations(deliveries);
            console.log("Delivery Locations:", deliveries);
          });
        });
      });

      return () => unsubscribe();
    }
  }, [selectedVehicle]);

  const handleMarkerClick = (delivery: Delivery) => {
    setSelectedMarker(delivery);
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
            mapRef.current = map;
          }}
        >
          {/* {userLocation && <Marker position={userLocation} />} */}

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
                    <Text style={styles.detailText}>Truck Number: {truckDetails?.VehicleNumber}</Text>
                  </View>
                </InfoWindow>
              )}
            </Marker>
          )}

          {/* Delivery location markers */}
          {deliveryLocations.map((delivery, index) => (
            <Marker
              key={delivery.id}
              position={{ lat: delivery.latitude, lng: delivery.longitude }}
              icon={getMarkerIcon(delivery.statusId)} // Set custom icon based on statusId
              onClick={() => handleMarkerClick(delivery)} 
            />
          ))}

           {/* InfoWindow for selected delivery marker */}
           {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
              onCloseClick={() => setSelectedMarker(null)} // Close InfoWindow
            >
              <View style={styles.infoWindow}>
                <Text style={styles.detailText}>Customer: {selectedMarker.customer}</Text>
                <Text style={styles.detailText}>Address: {selectedMarker.address}</Text>
              </View>
            </InfoWindow>
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
                onValueChange={(vehicle) => setSelectedVehicle(vehicle)}
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
    flexDirection: "row",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#343131",
    borderRadius: 8,
    padding: 16,
    width: 380,
  },
  pickerContainer: {
    marginBottom: 16,
    marginRight: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: 150,
    height: 30,
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