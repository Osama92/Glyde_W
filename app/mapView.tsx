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

// Type definitions
interface DeliveryDriver {
  Transporter: string;
  AssignedVanNo: string;
  Latitude: number;
  Longitude: number;
}

interface Transporter {
  [key: string]: string[]; 
}

interface TruckDetails {
  capacity: string;
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
  const mapRef = useRef<google.maps.Map | null>(null);

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

          console.log("Selected Vehicle Location (Real-Time):", newLocation);

          setVehicleLocation(newLocation);
          setTruckDetails({
            capacity: "8.453K0", // Example data
            status: "On-Route",
            arrivalDate: "28.10.23",
            type: "Household Chemicals",
          });

          // Animate the map to the selected vehicle's location
          if (mapRef.current) {
            console.log("Animating map to:", newLocation);
            mapRef.current.panTo(newLocation);
          } else {
            console.error("mapRef is not set");
          }
        });
      });

      // Cleanup listener on unmount or when vehicle changes
      return () => unsubscribe();
    }
  }, [selectedVehicle, onVehicleSelect]);

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
            console.log("Google Map loaded");
            mapRef.current = map;
          }}
        >
          {userLocation && <Marker position={userLocation} />}

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
                    <Text style={styles.detailText}>Capacity: {truckDetails?.capacity}</Text>
                    <Text style={styles.detailText}>Status: {truckDetails?.status}</Text>
                    <Text style={styles.detailText}>Arrival Date: {truckDetails?.arrivalDate}</Text>
                    <Text style={styles.detailText}>Type: {truckDetails?.type}</Text>
                  </View>
                </InfoWindow>
              )}
            </Marker>
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