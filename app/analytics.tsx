import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { app } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

const db = getFirestore(app);
const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedTransporter, setSelectedTransporter] = useState<string | null>(null);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const shipmentQuery = query(collection(db, 'Shipment'));
        const shipmentSnapshot = await getDocs(shipmentQuery);
        const shipmentData = shipmentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          freightCost: Number(doc.data().freightCost) || 0,
        }));
        setShipments(shipmentData);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const filteredShipments = useMemo(() => 
    shipments.filter(s => {
      const vehicleMatch = !selectedVehicle || s.vehicleNo === selectedVehicle;
      const transporterMatch = !selectedTransporter || s.transporter === selectedTransporter;
      return vehicleMatch && transporterMatch;
    }), [shipments, selectedVehicle, selectedTransporter]);

  const { statusData, totalShipments } = useMemo(() => {
    const total = filteredShipments.length || 1;
    const counts = {
      Delivered: filteredShipments.filter(s => s.statusId === 4).length,
      Dispatched: filteredShipments.filter(s => s.statusId === 2).length,
      InTransit: filteredShipments.filter(s => s.statusId === 3).length,
    };

    return {
      totalShipments: total,
      statusData: [
        { 
          value: counts.Delivered, 
          color: '#10b981',
          label: 'Delivered',
          percentage: (counts.Delivered / total) * 100
        },
        { 
          value: counts.Dispatched, 
          color: '#3b82f6',
          label: 'Dispatched',
          percentage: (counts.Dispatched / total) * 100
        },
        { 
          value: counts.InTransit, 
          color: '#8b5cf6',
          label: 'In Transit',
          percentage: (counts.InTransit / total) * 100
        },
      ]
    };
  }, [filteredShipments]);

  const freightData = useMemo(() => 
    filteredShipments.map((s, index) => ({
      value: s.freightCost,
      label: `Ship ${index + 1}`,
      frontColor: index % 2 === 0 ? '#3b82f6' : '#60a5fa',
      topLabelComponent: () => (
        <Text style={styles.barTopLabel}>
          ${s.freightCost.toLocaleString()}
        </Text>
      ),
    })), [filteredShipments]);

  const trendData = useMemo(() => 
    filteredShipments.map(s => ({
      value: s.freightCost,
      label: s.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dataPointText: `${s.driverName}\n₦${s.freightCost.toLocaleString()}`,
    })), [filteredShipments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
        <Text style={styles.headerTitle}>Advanced Shipment Analytics</Text>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Filter by Vehicle:</Text>
          <RNPickerSelect
            onValueChange={setSelectedVehicle}
            items={[...new Set(shipments.map(s => s.vehicleNo))].map(v => ({ label: v, value: v }))}
            placeholder={{ label: "All Vehicles", value: null }}
            style={pickerStyles}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Filter by Transporter:</Text>
          <RNPickerSelect
            onValueChange={setSelectedTransporter}
            items={[...new Set(shipments.map(s => s.transporter))].map(t => ({ label: t, value: t }))}
            placeholder={{ label: "All Transporters", value: null }}
            style={pickerStyles}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="local-shipping" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{totalShipments}</Text>
          <Text style={styles.statLabel}>Total Shipments</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="attach-money" size={24} color="#10b981" />
          <Text style={styles.statValue}>
          ₦{filteredShipments.reduce((sum, s) => sum + s.freightCost, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Freight Cost</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="pie-chart" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Shipment Status Distribution</Text>
        </View>
        <View style={styles.chartContainer}>
          <PieChart
            data={statusData}
            donut
            showGradient
            sectionAutoFocus
            radius={width * 0.12}
            innerRadius={width * 0.06}
            innerCircleColor="#f8fafc"
            focusOnPress
            onPress={(slice: any) => setActiveSlice(slice.label)}
            strokeWidth={2}
            strokeColor="#ffffff"
            centerLabelComponent={() => (
              <View style={styles.pieCenterLabel}>
                <Text style={styles.pieCenterText}>
                  {activeSlice || 'Total'}
                </Text>
                <Text style={styles.pieCenterSubtext}>
                  {activeSlice 
                    ? `${statusData.find(s => s.label === activeSlice)?.percentage.toFixed(1)}%`
                    : `${totalShipments} Shipments`}
                </Text>
              </View>
            )}
          />
          <View style={styles.legendContainer}>
            {statusData.map((status, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: status.color }]} />
                <Text style={styles.legendText}>
                  {status.label} ({status.percentage.toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="bar-chart" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Freight Cost Analysis</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={freightData}
            barWidth={width * 0.08}
            spacing={width * 0.05}
            frontColor="rgba(59, 130, 246, 0.6)"
            gradientColor="rgba(59, 130, 246, 1)"
            roundedTop
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            yAxisLabelWidth={50}
            maxValue={Math.max(...freightData.map(item => item.value)) * 1.2}
            noOfSections={5}
          />
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="show-chart" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Shipping Trends</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={trendData}
            curved
            dataPointsShape="CIRCLE"
            dataPointsColor="black"
            dataPointsRadius={6}
            color="orange"
            thickness={4}
            startFillColor="rgba(246, 168, 59, 0.8)"
            endFillColor="rgba(209, 171, 69, 0.06)"
            yAxisOffset={1000}
            xAxisLabelTexts={trendData.map(t => t.label)}
            xAxisLabelsVerticalShift={25}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            scrollToEnd
            scrollAnimation={true}
            areaChart
            startOpacity={1}
            endOpacity={0.1}
            spacing={width / trendData.length}
            hideRules
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  pieCenterLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  pieCenterSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#1e293b',
    fontSize: 14,
  },
  barTopLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
  },
  axisText: {
    color: '#64748b',
    fontSize: 12,
  },
});

const pickerStyles = StyleSheet.create({
  inputWeb: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    color: '#1e293b',
    fontSize: 14,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    color: '#1e293b',
    fontSize: 14,
  },
  placeholder: {
    color: '#94a3b8',
  },
});

export default DashboardScreen;
