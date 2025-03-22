import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // Adjust the import path as needed

const db = getFirestore(app);

interface CountCardsProps {
  // Optional props if you want to customize the component
}

// Define the structure for collection data
interface CollectionData {
  image: any; // Image source (require or URL)
  label: string; // Additional text for the collection
  count: number; // Document count
}

const CountCards: React.FC<CountCardsProps> = () => {
  const [collectionsData, setCollectionsData] = useState<{ [key: string]: CollectionData }>({
    Shipment: { image: require("../assets/images/shipment.png"), label: "Total Shipments", count: 0 },
    fieldagent: { image: require("../assets/images/agent.png"), label: "Total Field Agents", count: 0 },
    customer: { image: require("../assets/images/customer.png"), label: "Total Customers", count: 0 },
    deliverydriver: { image: require("../assets/images/driver.png"), label: "Total Delivery Drivers", count: 0 },
    transporter: { image: require("../assets/images/driver.png"), label: "Total Transporters", count: 0 },
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const collections = Object.keys(collectionsData);
        const updatedData = { ...collectionsData };

        for (const col of collections) {
          const querySnapshot = await getDocs(collection(db, col));
          updatedData[col].count = querySnapshot.size;
        }

        setCollectionsData(updatedData);
      } catch (error) {
        console.error("Error fetching document counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Object.entries(collectionsData).map(([key, data]) => (
        <View key={key} style={styles.card}>
          <View style={{flexDirection:'column', width:'70%'}}>
          <Text style={styles.cardCount}>{data.count}</Text>
          <Text style={styles.cardTitle}>{data.label}</Text>
          </View>
          <Image source={data.image} style={styles.cardImage} />
          
          
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  card: {
    flexDirection:'row',
    justifyContent:'space-between',
    width: Dimensions.get("window").width / 6 - 30, 
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'flex-start',
  },
  cardImage: {
    width: 20,
    height: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    //fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
    textAlign: 'left'
  },
  cardCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000", // Blue color for emphasis
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CountCards;