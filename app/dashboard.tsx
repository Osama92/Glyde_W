import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'expo-router'; 
import MapView from './mapView';
import ShipmentDetails from "../app/shipmentDetails";
import { useFonts } from 'expo-font';
import CountCards from './countCards';

const db = getFirestore(app);

const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isSidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [shipments, setShipments] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState(null);

  const [fontsLoaded] = useFonts({
    OpenSans: require('../assets/fonts/OpenSans.ttf'),
    Roboto: require('../assets/fonts/Roboto.ttf'),
  });

  const handleHoverIn = (item: any) => {
    setHoveredItem(item);
  };

  const handleHoverOut = () => {
    setHoveredItem(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shipmentQuery = query(collection(db, 'Shipment'));
        const shipmentSnapshot = await getDocs(shipmentQuery);
        const shipmentData = shipmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShipments(shipmentData);

        const deliveryData: any[] = [];
        for (const shipment of shipmentData) {
          const deliveryQuery = query(collection(db, 'Shipment', shipment.id, 'deliveries'));
          const deliverySnapshot = await getDocs(deliveryQuery);
          deliverySnapshot.forEach((doc) => {
            deliveryData.push({
              id: doc.id,
              shipmentId: shipment.id,
              ...doc.data(),
            });
          });
        }
        setDeliveries(deliveryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const fetchMaterials = async (deliveryId: string, shipmentId: string) => {
    try {
      // Fetch the delivery document
      const deliveryDocRef = doc(db, 'Shipment', shipmentId, 'deliveries', deliveryId);
      const deliverySnapshot = await getDoc(deliveryDocRef);
  
      if (deliverySnapshot.exists()) {
        // Extract the materials array from the delivery document
        const deliveryData = deliverySnapshot.data();
        const materialsData = deliveryData.materials || []; // Ensure materials is an array
  
        console.log('Materials Data:', materialsData); // Log the materials array
        setMaterials(materialsData); // Set the materials state
        setModalVisible(true); // Show the modal
      } else {
        console.error('Delivery document not found');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const totalQuantity = materials.reduce((sum, material) => sum + (material.quantity || 0), 0);
  const totalWeight = materials.reduce((sum, material) => sum + (material.weight || 0), 0);

  const getStatusText = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'Loaded';
      case 2:
        return 'Dispatched';
      case 3:
        return 'In Transit';
      case 4:
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return '#FFA500';
      case 2:
        return '#007BFF';
      case 3:
        return '#6F42C1';
      case 4:
        return '#28A745';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isMobile && (
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setSidebarVisible(!isSidebarVisible)}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {isSidebarVisible && (
        <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
          <TouchableOpacity onPress={() => router.push('/dashboard')}>
            <Image source={require('../assets/images/Glyde.png')} resizeMode='contain' style={{ width: 40, height: 40 }} />
          </TouchableOpacity>
          <View style={styles.menu}>
            <Pressable
              onPress={() => router.push('/dashboard')}
              style={styles.menuItem}
              onHoverIn={() => handleHoverIn('dashboard')}
              onHoverOut={handleHoverOut}
            >
              <Image
                source={require('../assets/images/dashC.png')}
                resizeMode="contain"
                style={{ width: 30, height: 30 }}
              />
              {hoveredItem === 'dashboard' && <Text style={styles.tooltip}>Dashboard</Text>}
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onHoverIn={() => handleHoverIn('tracking')}
              onHoverOut={handleHoverOut}
            >
              <Image
                source={require('../assets/images/tracC.png')}
                resizeMode="contain"
                style={{ width: 30, height: 30 }}
              />
              {hoveredItem === 'tracking' && <Text style={styles.tooltip}>Track</Text>}
            </Pressable>

            <Pressable
              onPress={() => router.push('/analytics')}
              style={styles.menuItem}
              onHoverIn={() => handleHoverIn('analytics')}
              onHoverOut={handleHoverOut}
            >
              <Image
                source={require('../assets/images/analyticsC.png')}
                resizeMode="contain"
                style={{ width: 30, height: 30 }}
              />
              {hoveredItem === 'analytics' && <Text style={styles.tooltip}>Analytics</Text>}
            </Pressable>

            <Pressable
              onPress={() => router.push('/addUser')}
              style={styles.menuItem}
              onHoverIn={() => handleHoverIn('addUser')}
              onHoverOut={handleHoverOut}
            >
              <Image
                source={require('../assets/images/userC.png')}
                resizeMode="contain"
                style={{ width: 30, height: 30 }}
              />
              {hoveredItem === 'addUser' && <Text style={styles.tooltip}>Add User</Text>}
            </Pressable>

            <Pressable
              onPress={() => router.push('/addMaterial')}
              style={styles.menuItem}
              onHoverIn={() => handleHoverIn('addMaterial')}
              onHoverOut={handleHoverOut}
            >
              <Image
                source={require('../assets/images/matC.png')}
                resizeMode="contain"
                style={{ width: 30, height: 30 }}
              />
              {hoveredItem === 'addMaterial' && <Text style={styles.tooltip}>Add Material</Text>}
            </Pressable>

            <Pressable
              onPress={() => router.push('/onboarding_approval')}
              style={styles.menuItem}
              onHoverIn={() => handleHoverIn('onboarding_approval')}
              onHoverOut={handleHoverOut}
            >
              <Image
                source={require('../assets/images/approvedC.png')}
                resizeMode="contain"
                style={{ width: 30, height: 30 }}
              />
              {hoveredItem === 'onboarding_approval' && <Text style={styles.tooltip}>Onboarding Approval</Text>}
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView style={[styles.content, isMobile && isSidebarVisible && styles.contentShifted]}>
        <View style={styles.searchContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle1}>Hello Admin 👋🏻</Text>
            <CountCards/>
            <Text style={styles.sectionTitle}>Track Delivery Vehicles</Text>
            <MapView onVehicleSelect={(vehicle) => setSelectedVehicle(vehicle)}/>
            <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', height: 350, padding: 16}}>
              <ShipmentDetails selectedVehicle={selectedVehicle} />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Shipment</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Delivery Number"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={'#666'}
            />
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Shipment#</Text>
              <Text style={styles.tableHeader}>Delivery#</Text>
              <Text style={styles.tableHeader}>Customer</Text>
              <Text style={styles.tableHeader}>Date</Text>
              <Text style={styles.tableHeader}>Destination</Text>
              <Text style={styles.tableHeader}>Status</Text>
            </View>
            {filteredDeliveries.map((delivery, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tableRow}
                onPress={() => fetchMaterials(delivery.id, delivery.shipment)}
              >
                <Text style={styles.tableCell}>{delivery.shipmentId}</Text>
                <Text style={styles.tableCell}>{delivery.deliveryNumber}</Text>
                <Text style={styles.tableCell}>{delivery.customer}</Text>
                <Text style={styles.tableCell}>{delivery.createdAt}</Text>
                <Text style={styles.tableCell}>{delivery.address}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { backgroundColor: getStatusColor(delivery.statusId), borderRadius: 5, padding: 2, color: '#fff' },
                  ]}
                >
                  {getStatusText(delivery.statusId)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <Modal
  visible={isModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Delivery Contents</Text>
      <View style={styles.modalTable}>
        <View style={styles.modalTableRow}>
          <Text style={styles.modalTableHeader}>Item Description</Text>
          <Text style={styles.modalTableHeader}>Quantity</Text>
          <Text style={styles.modalTableHeader}>Total Weight</Text>
        </View>
        {materials.map((material, index) => (
          <View key={index} style={styles.modalTableRow}>
            <Text style={styles.modalTableCell}>{material.name}</Text>
            <Text style={styles.modalTableCell}>{material.quantity}</Text>
            <Text style={styles.modalTableCell}>{material.totalWeight}</Text>
          </View>
        ))}
        {/* Totals Row */}
        <View style={styles.modalTableRow}>
          <Text style={styles.modalTableCell}>Total</Text>
          <Text style={styles.modalTableCell}>
            {materials.reduce((sum, material) => sum + (material.quantity || 0), 0)}
          </Text>
          <Text style={styles.modalTableCell}>
            {materials.reduce((sum, material) => sum + (material.totalWeight || 0), 0)}
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.modalCloseButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.modalCloseButtonText}>Close</Text>
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
    backgroundColor: '#fff',
  },
  sidebar: {
    width: 90,
    backgroundColor: '#f3f3f3',
    padding: 20,
  },
  mobileSidebar: {
    width: '100%',
    position: 'absolute',
    zIndex: 1,
    height: '100%',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  menu: {
    marginTop: 60,
  },
  menuItem: {
    marginBottom: 30,
    width:40,
    height:40,
    backgroundColor:'#F9f9f9',
    borderRadius: 5,
    justifyContent:'center',
    alignItems:'center'
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentShifted: {
    marginLeft: 250,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 30,
    marginBottom: 10,
    fontFamily: 'OpenSans',
  },
  sectionTitle1: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Roboto'
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsCardTitle: {
    fontSize: 16,
    color: '#666',
  },
  analyticsCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  chartsContainer: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chart: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    padding: 10,
  },
  tableCell: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
    padding: 10,
  },
  hamburgerButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTable: {
    marginBottom: 20,
  },
  modalTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  modalTableCell: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tooltip: {
    position: 'absolute',
    top: -25,
    backgroundColor: 'black',
    color: 'white',
    padding: 5,
    borderRadius: 5,
    fontSize: 10,
    textAlign:'center'
  },
});

export default DashboardScreen;