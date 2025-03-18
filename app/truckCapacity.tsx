// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { db } from "../firebase"; // Adjust the path to your Firebase config
// import { collection, query, where, onSnapshot } from "firebase/firestore";

// interface TruckCapacityProps {
//   selectedVehicle: string; // Selected AssignedVanNo
// }

// interface TruckData {
//   capacityPercentage: number; // Current capacity percentage (e.g., 86)
//   vehicleNumber: string; // Truck ID (e.g., "AL-223965406")
//   maxLoad: string; // Max load (e.g., "8.453K0")
// }

// export default function TruckCapacity({ selectedVehicle }: TruckCapacityProps) {
//   const [truckData, setTruckData] = useState<TruckData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");

//   // Fetch truck capacity data based on the selected vehicle
//   useEffect(() => {
//     if (selectedVehicle) {
//       const q = query(collection(db, "deliverydriver"), where("AssignedVanNo", "==", selectedVehicle));

//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         if (!querySnapshot.empty) {
//           const doc = querySnapshot.docs[0];
//           const data = doc.data() as TruckData;
//           setTruckData(data);
//         } else {
//           setTruckData(null); // No matching truck data found
//         }
//         setLoading(false);
//       }, (err) => {
//         setError("Failed to fetch truck capacity data");
//         console.error(err);
//         setLoading(false);
//       });

//       // Cleanup listener on unmount
//       return () => unsubscribe();
//     } else {
//       setTruckData(null); // Reset truck data if no vehicle is selected
//       setLoading(false);
//     }
//   }, [selectedVehicle]);

//   if (loading) return <Text>Loading truck capacity...</Text>;
//   if (error) return <Text>{error}</Text>;
//   if (!truckData) return <Text>No truck data found for the selected vehicle.</Text>;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Current Truck Capacity</Text>
//       <View style={styles.progressBarContainer}>
//         <View
//           style={[
//             styles.progressBar,
//             { width: `${truckData.capacityPercentage}%` }, // Dynamic width based on capacity
//           ]}
//         />
//       </View>
//       <Text style={styles.percentage}>{truckData.capacityPercentage}%</Text>
//       <Text style={styles.truckId}>{truckData.vehicleNumber}</Text>
//       <Text style={styles.maxLoad}>Max Load: {truckData.maxLoad}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     margin: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   progressBarContainer: {
//     height: 10,
//     backgroundColor: "#e0e0e0",
//     borderRadius: 5,
//     overflow: "hidden",
//     marginBottom: 8,
//   },
//   progressBar: {
//     height: "100%",
//     backgroundColor: "#007BFF", // Blue color for the progress bar
//   },
//   percentage: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#007BFF",
//     marginBottom: 8,
//   },
//   truckId: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 4,
//   },
//   maxLoad: {
//     fontSize: 14,
//     color: "#333",
//   },
// });

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native"; // Import Image
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface TruckCapacityProps {
  selectedVehicle: string; // Selected AssignedVanNo
}

interface TruckData {
  tons: number; // Current capacity percentage (e.g., 86)
  VehicleNo: string; // Truck ID (e.g., "AL-223965406")
  maxLoad: string; // Max load (e.g., "8.453K0")
  imageUrl: string; // URL of the vehicle image
  tonnage: string; // Max tonnage
  freightCost: number
}

export default function TruckCapacity({ selectedVehicle }: TruckCapacityProps) {
  const [truckData, setTruckData] = useState<TruckData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch truck capacity data based on the selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      const q = query(collection(db, "Shipment"), where("VehicleNo", "==", selectedVehicle));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data() as TruckData;
          setTruckData(data);
        } else {
          setTruckData(null); // No matching truck data found
        }
        setLoading(false);
      }, (err) => {
        setError("Failed to fetch truck capacity data");
        console.error(err);
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      setTruckData(null); // Reset truck data if no vehicle is selected
      setLoading(false);
    }
  }, [selectedVehicle]);

  if (loading) return <Text>Loading truck capacity...</Text>;
  if (error) return <Text>{error}</Text>;
  if (!truckData) return <Text>No truck data found for the selected vehicle.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Truck Capacity</Text>

      {/* Display the vehicle image */}
      {truckData.imageUrl && (
        <Image
          source={truckData.imageUrl ? { uri: truckData.imageUrl } : require("../assets/images/Van0.png")}
          style={styles.vehicleImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${truckData.tons}%` }, // Dynamic width based on capacity
          ]}
        />
      </View>
      <Text style={styles.percentage}>{truckData.tonnage}%</Text>
      <Text style={styles.truckId}>Vehicle No: {truckData.VehicleNo}</Text>
      <Text style={styles.maxLoad}>Max Load: {truckData.maxLoad}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  vehicleImage: {
    width: "100%",
    height: 200, // Adjust height as needed
    borderRadius: 8,
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007BFF", // Blue color for the progress bar
  },
  percentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 8,
  },
  truckId: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  maxLoad: {
    fontSize: 14,
    color: "#333",
  },
});