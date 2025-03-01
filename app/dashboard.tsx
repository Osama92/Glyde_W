import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { MaterialIcons } from '@expo/vector-icons';

const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Define breakpoint for mobile
  const [isSidebarVisible, setSidebarVisible] = useState(!isMobile); // Sidebar visible by default on desktop

  // Sample data for the graph
  const graphData = [
    { x: 'Oct 30', y: 120 },
    { x: 'Oct 31', y: 150 },
    { x: 'Nov 01', y: 200 },
    { x: 'Nov 02', y: 180 },
    { x: 'Nov 03', y: 220 },
    { x: 'Nov 04', y: 250 },
    { x: 'Nov 05', y: 300 },
  ];

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
              <Text style={styles.analyticsCardValue}>120</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>Cashflow</Text>
              <Text style={styles.analyticsCardValue}>$5,000</Text>
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
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={20}
            width={isMobile ? width - 40 : 600} // Adjust width for mobile
          >
            <VictoryAxis
              tickValues={graphData.map((data) => data.x)}
              style={{
                tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' },
              }}
            />
            <VictoryAxis dependentAxis />
            <VictoryBar
              data={graphData}
              x="x"
              y="y"
              style={{ data: { fill: '#FFA500' } }
            />
          </VictoryChart>
        </View>

        {/* Cashflow Stat Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cashflow Stat</Text>
          <View style={styles.cashflowGrid}>
            <View style={styles.cashflowCard}>
              <Text style={styles.cashflowCardTitle}>Income</Text>
              <Text style={styles.cashflowCardValue}>$10,000</Text>
            </View>
            <View style={styles.cashflowCard}>
              <Text style={styles.cashflowCardTitle}>Spend</Text>
              <Text style={styles.cashflowCardValue}>$5,000</Text>
            </View>
          </View>
        </View>

        {/* Recent Shipment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Shipment</Text>
          <Text style={styles.sectionSubtitle}>This data from October 30 - November 05</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>ID Tracking</Text>
              <Text style={styles.tableHeader}>Customer</Text>
              <Text style={styles.tableHeader}>Date</Text>
              <Text style={styles.tableHeader}>Weight</Text>
              <Text style={styles.tableHeader}>Recent Location</Text>
              <Text style={styles.tableHeader}>Status</Text>
              <Text style={styles.tableHeader}>Action</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>8JXIGL21#N1</Text>
              <Text style={styles.tableCell}>Johny Iskandar</Text>
              <Text style={styles.tableCell}>2023-11-05</Text>
              <Text style={styles.tableCell}>3.2kg</Text>
              <Text style={styles.tableCell}>Main Post Office, New York, USA</Text>
              <Text style={styles.tableCell}>Transit</Text>
              <Text style={styles.tableCell}>Transit</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>TRK789012</Text>
              <Text style={styles.tableCell}>Carlos Rodriguez</Text>
              <Text style={styles.tableCell}>2023-11-05</Text>
              <Text style={styles.tableCell}>2.8kg</Text>
              <Text style={styles.tableCell}>Distribution Center, Los Angeles, USA</Text>
              <Text style={styles.tableCell}>Completed</Text>
              <Text style={styles.tableCell}>Completed</Text>
            </View>
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
    width: '100%', // Full width on mobile
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
    marginLeft: 250, // Shift content when sidebar is visible on mobile
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
  cashflowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cashflowCard: {
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
  cashflowCardTitle: {
    fontSize: 16,
    color: '#666',
  },
  cashflowCardValue: {
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
});

export default DashboardScreen;