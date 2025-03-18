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
  Image
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'expo-router'; 
import MapView from './mapView';
import ShipmentDetails from "../app/shipmentDetails";
import TruckCapacity from "../app/truckCapacity";
import  VehicleImage  from '../app/vehicleImage';
import { Vehicle } from '../types';


const vehicles: Vehicle[] = [
  { id: '1', name: 'Bus 3 Tons', imageUrl: 'https://example.com/bus-3-ton.jpg' },
  { id: '2', name: 'Truck 5 Tons', imageUrl: 'https://example.com/truck-5-ton.jpg' },
  { id: '3', name: 'Van 1 Ton', imageUrl: 'https://example.com/van-1-ton.jpg' },
];



const db = getFirestore(app);

//const { width } = useWindowDimensions();
const isMobile = 768;

const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isSidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [shipments, setShipments] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const router = useRouter(); // Initialize router for navigation



 

  // Fetch shipments and deliveries from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shipments
        const shipmentQuery = query(collection(db, 'Shipment'));
        const shipmentSnapshot = await getDocs(shipmentQuery);
        const shipmentData = shipmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShipments(shipmentData);

        // Fetch deliveries for each shipment
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

  // Filter deliveries based on search query
  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total number of shipments
  const totalShipments = shipments.length;

  // Calculate total freight cost
  const totalFreightCost = shipments.reduce((sum, shipment) => sum + (shipment.freightCost || 0), 0);

  // Fetch materials for a delivery
  const fetchMaterials = async (deliveryId: string, shipmentId: string) => {
    try {
      const materialsQuery = query(collection(db, 'Shipment', shipmentId, 'deliveries', deliveryId, 'materials'));
      const materialsSnapshot = await getDocs(materialsQuery);
      const materialsData = materialsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterials(materialsData);
      setModalVisible(true); // Show the modal
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  // Calculate total quantity and weight of materials
  const totalQuantity = materials.reduce((sum, material) => sum + (material.quantity || 0), 0);
  const totalWeight = materials.reduce((sum, material) => sum + (material.weight || 0), 0);

  // Map statusId to human-readable statuses
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

  // Get status color based on statusId
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return '#FFA500'; // Orange for Loaded
      case 2:
        return '#007BFF'; // Blue for Dispatched
      case 3:
        return '#6F42C1'; // Purple for In Transit
      case 4:
        return '#28A745'; // Green for Delivered
      default:
        return '#666'; // Gray for Unknown
    }
  };

  // Sample data for the graphs
  const barData = [
    { value: 120, label: 'Oct 30' },
    { value: 150, label: 'Oct 31' },
    { value: 200, label: 'Nov 01' },
    { value: 180, label: 'Nov 02' },
    { value: 220, label: 'Nov 03' },
    { value: 250, label: 'Nov 04' },
    { value: 300, label: 'Nov 05' },
  ];

  const lineData = [
    { value: 120, label: 'Oct 30' },
    { value: 150, label: 'Oct 31' },
    { value: 200, label: 'Nov 01' },
    { value: 180, label: 'Nov 02' },
    { value: 220, label: 'Nov 03' },
    { value: 250, label: 'Nov 04' },
    { value: 300, label: 'Nov 05' },
  ];

  const pieData = [
    { value: 40, color: '#FFA500', label: 'Loaded' },
    { value: 30, color: '#007BFF', label: 'Dispatched' },
    { value: 20, color: '#6F42C1', label: 'In Transit' },
    { value: 10, color: '#28A745', label: 'Delivered' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hamburger Menu Button (Mobile Only) */}
      {isMobile && (
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setSidebarVisible(!isSidebarVisible)}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Left Sidebar */}
      {isSidebarVisible && (
        <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
          <TouchableOpacity onPress={() => router.push('/dashboard')}>
          <Image source={require('../assets/images/Glyde.png')} resizeMode='contain' style={{width:40, height:40}}/>
          </TouchableOpacity>
          <View style={styles.menu}>
            <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.menuItem}>
              <Image source={require('../assets/images/dashboard.png')} resizeMode='contain' style={{width:30, height: 30}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/analytics')} style={styles.menuItem}>
            <Image source={require('../assets/images/analytics.png')} resizeMode='contain' style={{width:30, height: 30}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/addUser')} style={styles.menuItem}>
            <Image source={require('../assets/images/user.png')} resizeMode='contain' style={{width:30, height: 30}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/addMaterial')} style={styles.menuItem}>
            <Image source={require('../assets/images/mm2.png')} resizeMode='contain' style={{width:30, height: 30}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/onboarding_approval')} style={styles.menuItem}>
            <Image source={require('../assets/images/approved.png')} resizeMode='contain' style={{width:30, height: 30}}/>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView style={[styles.content, isMobile && isSidebarVisible && styles.contentShifted]}>
        {/* Search Input */}
        <View style={styles.searchContainer}>


        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle1}>Hello Admin 👋🏻</Text>
          <Text style={styles.sectionTitle}>Track Delivery Vehicles</Text>
          <MapView onVehicleSelect={(vehicle) => setSelectedVehicle(vehicle)}/>
          <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', height: 350, padding: 16}}>
          <ShipmentDetails selectedVehicle={selectedVehicle} />
          {/* <TruckCapacity selectedVehicle={selectedVehicle} /> */}
          </View>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Shipment</Text>
              <Text style={styles.analyticsCardValue}>{totalShipments}</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Freight Cost</Text>
              <Text style={styles.analyticsCardValue}>₦{totalFreightCost.toFixed(2)}</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Message</Text>
              <Text style={styles.analyticsCardValue}>15</Text>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsContainer}>
          <View style={styles.chart}>
            <Text style={styles.sectionTitle}>Shipment Metrics</Text>
            <BarChart
              data={barData}
              barWidth={isMobile ? 30 : 40}
              spacing={20}
              roundedTop
              roundedBottom
              frontColor="#FFA500"
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={5}
              yAxisTextStyle={{ color: '#666' }}
              xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
              showReferenceLine1
              referenceLine1Position={200}
              referenceLine1Config={{ color: 'red', dashWidth: 2, dashGap: 3 }}
            />
          </View>
          <View style={styles.chart}>
            <Text style={styles.sectionTitle}>Shipment Trends</Text>
            <LineChart
              data={lineData}
              width={isMobile ? width - 40 : 300}
              height={200}
              color="#007BFF"
              dataPointsColor="#007BFF"
              dataPointsRadius={5}
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={5}
              yAxisTextStyle={{ color: '#666' }}
              xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
            />
          </View>
        </View>

        {/* Pie Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Status</Text>
          <PieChart
            data={pieData}
            radius={100}
            innerRadius={50}
            centerLabelComponent={() => (
              <Text style={{ fontSize: 16, color: '#333' }}>Status</Text>
            )}
          />
        </View>

        {/* Recent Shipment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Shipment</Text>
          <Text style={styles.sectionSubtitle}>This data from October 30 - November 05</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Delivery Number"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Shipment#</Text>
              <Text style={styles.tableHeader}>Delivery#</Text>
              <Text style={styles.tableHeader}>Customer</Text>
              <Text style={styles.tableHeader}>Date</Text>
              <Text style={styles.tableHeader}>Weight</Text>
              <Text style={styles.tableHeader}>Destination</Text>
              <Text style={styles.tableHeader}>Status</Text>
            </View>
            {filteredDeliveries.map((delivery, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tableRow}
                onPress={() => fetchMaterials(delivery.id, delivery.shipmentId)}
              >
                <Text style={styles.tableCell}>{delivery.shipmentId}</Text>
                <Text style={styles.tableCell}>{delivery.deliveryNumber}</Text>
                <Text style={styles.tableCell}>{delivery.customer}</Text>
                <Text style={styles.tableCell}>{delivery.createdAt}</Text>
                <Text style={styles.tableCell}>{delivery.weight}</Text>
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

      {/* Materials Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Materials</Text>
            <View style={styles.modalTable}>
              <View style={styles.modalTableRow}>
                <Text style={styles.modalTableHeader}>Name</Text>
                <Text style={styles.modalTableHeader}>Quantity</Text>
                <Text style={styles.modalTableHeader}>Weight</Text>
              </View>
              {materials.map((material, index) => (
                <View key={index} style={styles.modalTableRow}>
                  <Text style={styles.modalTableCell}>{material.name}</Text>
                  <Text style={styles.modalTableCell}>{material.quantity}</Text>
                  <Text style={styles.modalTableCell}>{material.weight}</Text>
                </View>
              ))}
              {/* Totals Row */}
              <View style={styles.modalTableRow}>
                <Text style={styles.modalTableCell}>Total</Text>
                <Text style={styles.modalTableCell}>{totalQuantity}</Text>
                <Text style={styles.modalTableCell}>{totalWeight}</Text>
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
    width:50,
    height:50,
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 15
  },
  sectionTitle1: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 40,
    marginLeft: 15
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
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chart: {
    flex: 1,
    marginRight: isMobile ? 0 : 10,
    marginBottom: isMobile ? 20 : 0,
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
  },
  tableCell: {
    fontSize: 14,
    color: '#666',
    flex: 1,
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
  },
  modalTableCell: {
    fontSize: 14,
    color: '#666',
    flex: 1,
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
});

export default DashboardScreen;
