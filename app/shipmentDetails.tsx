// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { db } from "../firebase"; // Adjust the path to your Firebase config
// import { collection, query, where, onSnapshot } from "firebase/firestore";

// interface Shipment {
//   vehicleNo: string;
//   driverName: string;
//   transporter: string;
//   route: string;
//   statusId: number;
//   mobileNumber: string;
// }

// interface ShipmentDetailsProps {
//   selectedVehicle: string;
// }

// export default function ShipmentDetails({ selectedVehicle }: ShipmentDetailsProps) {
//   const [shipment, setShipment] = useState<Shipment | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");

//   // Fetch shipment details based on the selected vehicle
//   useEffect(() => {
//     if (selectedVehicle) {
//       const q = query(collection(db, "Shipment"), where("vehicleNo", "==", selectedVehicle));

//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         if (!querySnapshot.empty) {
//           const doc = querySnapshot.docs[0];
//           const shipmentData = doc.data() as Shipment;
//           setShipment(shipmentData);
//         } else {
//           setShipment(null); // No matching shipment found
//         }
//         setLoading(false);
//       }, (err) => {
//         setError("Failed to fetch shipment details");
//         console.error(err);
//         setLoading(false);
//       });

//       // Cleanup listener on unmount
//       return () => unsubscribe();
//     } else {
//       setShipment(null); // Reset shipment details if no vehicle is selected
//       setLoading(false);
//     }
//   }, [selectedVehicle]);

//   if (loading) return <Text>Loading shipment details...</Text>;
//   if (error) return <Text>{error}</Text>;
//   if (!shipment) return <Text>No shipment found for the selected vehicle.</Text>;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Shipment Details</Text>
//       <Text style={styles.detail}>Driver Name: {shipment.driverName}</Text>
//       <Text style={styles.detail}>Route: {shipment.route}</Text>
//       <Text style={styles.detail}>Status: {shipment.statusId}</Text>
//       <Text style={styles.detail}>Transporter: {shipment.transporter}</Text>
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
//   detail: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
// });

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from "react-native";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface Shipment {
  vehicleNo: string;
  driverName: string;
  transporter: string;
  route: string;
  statusId: number;
  mobileNumber: string;
}

interface ShipmentDetailsProps {
  selectedVehicle: string;
}

// Map statusId to status text
const getStatusText = (statusId: number): string => {
  switch (statusId) {
    case 1:
      return "Loaded";
    case 2:
      return "Dispatch";
    case 3:
      return "Intransit";
    case 4:
      return "Delivered";
    default:
      return "Unknown";
  }
};

export default function ShipmentDetails({ selectedVehicle }: ShipmentDetailsProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Fetch shipment details based on the selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      const q = query(collection(db, "Shipment"), where("vehicleNo", "==", selectedVehicle));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const shipments: Shipment[] = [];
          querySnapshot.forEach((doc) => {
            const shipmentData = doc.data() as Shipment;
            shipments.push(shipmentData);
          });

          setShipment(shipments[0]); // Display the first shipment by default
          setAllShipments(shipments); // Store all shipments for the modal
        } else {
          setShipment(null); // No matching shipment found
          setAllShipments([]);
        }
        setLoading(false);
      }, (err) => {
        setError("Failed to fetch shipment details");
        console.error(err);
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      setShipment(null); // Reset shipment details if no vehicle is selected
      setAllShipments([]);
      setLoading(false);
    }
  }, [selectedVehicle]);

  if (loading) return <Text>Loading shipment details...</Text>;
  if (error) return <Text>{error}</Text>;
  if (!shipment) return <Text>No shipment found for the selected vehicle.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shipment Details</Text>
      <Text style={styles.detail}>Driver Name: {shipment.driverName}</Text>
      <Text style={styles.detail}>Route: {shipment.route}</Text>
      <Text style={styles.detail}>Status: {getStatusText(shipment.statusId)}</Text>
      <Text style={styles.detail}>Transporter: {shipment.transporter}</Text>

      {/* Show "See All" button if statusId is less than 4 */}
      {shipment.statusId < 4 && (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.seeAllButtonText}>View all shipment</Text>
        </TouchableOpacity>
      )}

      {/* Modal to display all shipments */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Shipments</Text>
            <FlatList
              data={allShipments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.shipmentItem}>
                  <Text style={styles.shipmentText}>Driver: {item.driverName}</Text>
                  <Text style={styles.shipmentText}>Route: {item.route}</Text>
                  <Text style={styles.shipmentText}>Status: {getStatusText(item.statusId)}</Text>
                  <Text style={styles.shipmentText}>Transporter: {item.transporter}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FE7A36",
    borderRadius: 20,
    // margin: 16,
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    color:'#fff'
  },
  detail: {
    fontSize: 14,
    marginBottom: 4,
    color:'#fff'
    
  },
  seeAllButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    // backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 5,
  },
  seeAllButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  shipmentItem: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  shipmentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "flex-end",
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});