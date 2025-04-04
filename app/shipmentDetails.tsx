import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, ImageBackground, ImageSourcePropType } from "react-native";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface Shipment {
  vehicleNo: string;
  driverName: string;
  transporter: string;
  route: string;
  statusId: number;
  mobileNumber: string;
  tonnage: string;
  tons: number;
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

const getTonnage = (tons: string): number => {
  switch (tons) {
    case "Truck 20 ton":
      return 20000;
    case "Truck 10 ton":
      return 10000;
    case "Truck 5 ton":
      return 5000;
    case "Truck 3 ton":
      return 3000;
    case "Truck 1 ton":
      return 1000;
    case "Truck 0.5 ton":
      return 500;
    default:
      return 0;
  }
};

const getImage = (uri: string): ImageSourcePropType => {
  switch (uri) {
    case "Truck 20 ton":
      return require("../assets/images/Truck_20_ton.png");
    case "Truck 30 ton":
      return require("../assets/images/Truck_30_ton.png");
    case "Truck 10 ton":
      return require("../assets/images/Truck_10_ton.png");
    case "Truck 3 ton":
      return require("../assets/images/Truck_3_ton.png");
    default:
      return require("../assets/images/Van0.png");
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
            console.log(shipmentData);
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
  if (!shipment) return <View style={{flex:1, justifyContent:'center', alignItems:'center', width: '100%', height: '100%'}}>
    <Text style={{textAlign:'center',fontSize: 30, color:'#666'}}>No shipment found for the selected vehicle.</Text>
    <Text style={{fontStyle:'italic'}}>Select a Transporter and Vehicle for shipment details</Text>
  </View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shipment Details</Text>
      <View style={{flexDirection:'row', justifyContent:'space-between', height:'100%'}}>
    
      <View style={{width:'50%', height:'90%', flexDirection:'row', flexWrap:'wrap', alignItems:'center'}}>
      <View style={{width:200, height: 60, backgroundColor:'#F7F7F7', borderRadius: 10, justifyContent:'center', alignItems:'flex-start', flexDirection:'column', marginRight: 10}}>
      <Image source={require('../assets/images/truck1.png')} resizeMode="contain" style={{width:20, height:20, marginLeft: 10}}/>
      <Text style={styles.detail}>Transporter: {shipment.transporter}</Text>
      </View>
      <View style={{width:200, height: 60, backgroundColor:'#F7F7F7', borderRadius: 10, justifyContent:'center', alignItems:'flex-start', flexDirection:'column', marginRight: 10}}>
      <Image source={require('../assets/images/user1.png')} resizeMode="contain" style={{width:15, height:15, marginLeft: 10}}/>
      <Text style={styles.detail}>Driver: {shipment.driverName}</Text>
      </View>

      <View style={{width:200, height: 60, backgroundColor:'#F7F7F7', borderRadius: 10, justifyContent:'center', alignItems:'flex-start', flexDirection:'column', marginRight: 10}}>
      <Image source={require('../assets/images/dive.png')} resizeMode="contain" style={{width:20, height:20, marginLeft: 10}}/>
      <Text style={styles.detail}>Licence No.: {shipment.vehicleNo}</Text>
      </View>

      <View style={{width:200, height: 60, backgroundColor:'#F7F7F7', borderRadius: 10, justifyContent:'center', alignItems:'flex-start', flexDirection:'column', marginRight: 10}}>
      <Image source={require('../assets/images/cap.png')} resizeMode="contain" style={{width:20, height:20, marginLeft: 10}}/>
      <Text style={styles.detail}>Capacity: {shipment.tonnage}</Text>
      </View>

      <View style={{width:200, height: 60, backgroundColor:'#F7F7F7', borderRadius: 10, justifyContent:'center', alignItems:'flex-start', flexDirection:'column', marginRight: 10}}>
      <Image source={require('../assets/images/box.png')} resizeMode="contain" style={{width:20, height:20, marginLeft: 10}}/>
      <Text style={styles.detail}>Status: {getStatusText(shipment.statusId)}</Text>
      </View>

      <View style={{width:200, height:60}}>
      {shipment.statusId && (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.seeAllButtonText}>View all shipment</Text>
        </TouchableOpacity>
      )}
      </View>
      </View>
      <View style={{width:'50%', height:'90%'}}>
        <Text style={{fontSize: 20, fontWeight: '700', color:'#000', marginBottom: 10, alignSelf:'center'}}>Current Truck Utilization</Text>

<ImageBackground 
  source={getImage(shipment.tonnage)} 
  resizeMode="cover" 
  style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center',marginBottom: 10 }}
>
  {/* Overlay View */}
  <View 
    style={{
      position: 'absolute',
      width: '80%', 
      height: 200, 
      alignItems: 'center',
      zIndex: 1, 
    }}
  >
    <Text style={{ color: '#000', fontSize: 90, marginTop:10, fontWeight:'bold' }}>{parseFloat((((getTonnage(shipment.tonnage) - shipment.tons) / getTonnage(shipment.tonnage)) * 100).toFixed(2))}%</Text>
  </View>
</ImageBackground>

      </View>

      </View>
      

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
    backgroundColor: "#EEEEEE",
    borderRadius: 20,
    // margin: 16,
    //justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    //marginBottom: 15,
    color:'#000'
  },
  detail: {
    fontSize: 14,
    marginBottom: 4,
    color:'#000',
    marginLeft: 10,
    
  },
  seeAllButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    // backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 5,
  },
  seeAllButtonText: {
    color: "#FF6500",
    fontSize: 13,
    fontWeight:'600'
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