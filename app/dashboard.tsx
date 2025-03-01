import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isSidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [shipments, setShipments] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate total number of shipments
  const totalShipments = shipments.length;

  // Calculate total freight cost
  const totalFreightCost = shipments.reduce((sum, shipment) => sum + (shipment.freightCost || 0), 0);

  // Sample data for the graph
  const graphData = [
    { value: 120, label: 'Oct 30' },
    { value: 150, label: 'Oct 31' },
    { value: 200, label: 'Nov 01' },
    { value: 180, label: 'Nov 02' },
    { value: 220, label: 'Nov 03' },
    { value: 250, label: 'Nov 04' },
    { value: 300, label: 'Nov 05' },
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
          <Text style={styles.sidebarTitle}>Dashboard</Text>
          <View style={styles.menu}>
            <Text style={styles.menuItem}>Shipment</Text>
            <Text style={styles.menuItem}>Cashflow</Text>
            <Text style={styles.menuItem}>Message</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView style={[styles.content, isMobile && isSidebarVisible && styles.contentShifted]}>
        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <Text style={styles.sectionSubtitle}>This data from October 30 - November 05</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Shipment</Text>
              <Text style={styles.analyticsCardValue}>{totalShipments}</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Freight Cost</Text>
              <Text style={styles.analyticsCardValue}>${totalFreightCost.toFixed(2)}</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Message</Text>
              <Text style={styles.analyticsCardValue}>15</Text>
            </View>
          </View>
        </View>

        {/* Graph Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Metrics</Text>
          <BarChart
            data={graphData}
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

        {/* Recent Shipment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Shipment</Text>
          <Text style={styles.sectionSubtitle}>This data from October 30 - November 05</Text>
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
            {deliveries.map((delivery, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{delivery.shipmentId}</Text>
                <Text style={styles.tableCell}>{delivery.deliveryNumber}</Text>
                <Text style={styles.tableCell}>{delivery.customer}</Text>
                <Text style={styles.tableCell}>{delivery.createdAt}</Text>
                <Text style={styles.tableCell}>{delivery.weight}</Text>
                <Text style={styles.tableCell}>{delivery.address}</Text>
                <Text style={styles.tableCell}>{delivery.statusId}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#2c3e50',
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
    marginTop: 20,
  },
  menuItem: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentShifted: {
    marginLeft: 250,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
});

export default DashboardScreen;