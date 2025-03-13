import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { app } from "../firebase";
import { router } from "expo-router";

const db = getFirestore(app);

export default function CreateMaterialScreen() {
  const [originPoints, setOriginPoints] = useState<any[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [materialName, setMaterialName] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [uom, setUom] = useState<string>("Cartons");
  const [productSensitivity, setProductSensitivity] = useState<string>("Fragile");
  const [isNewOrigin, setIsNewOrigin] = useState<boolean>(false);
  const [newOriginName, setNewOriginName] = useState<string>("");

  useEffect(() => {
    fetchOriginPoints();
  }, []);

  const fetchOriginPoints = async () => {
    setIsLoading(true);
    try {
      const originPointsRef = collection(db, "originPoint");
      const querySnapshot = await getDocs(originPointsRef);
      const origins = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOriginPoints(origins);
    } catch (error) {
      console.error("Error fetching origin points:", error);
      Alert.alert("Error", "Failed to fetch origin points.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async (originId: string) => {
    setIsLoading(true);
    try {
      const materialsRef = collection(db, `originPoint/${originId}/materials`);
      const querySnapshot = await getDocs(materialsRef);
      const materialsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMaterials(materialsData);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching materials:", error);
      Alert.alert("Error", "Failed to fetch materials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMaterial = async () => {
    if ((!isNewOrigin && !selectedOrigin) || !materialName.trim() || !weight.trim()) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const originId = isNewOrigin ? newOriginName : selectedOrigin.id;

      // If it's a new origin, add it to the "originPoint" collection
      if (isNewOrigin) {
        const originRef = doc(db, "originPoint", originId);
        await setDoc(originRef, { name: originId });
      }

      // Add material to the subcollection
      const materialsRef = collection(db, `originPoint/${originId}/materials`);
      await addDoc(materialsRef, {
        name: materialName,
        weight: parseFloat(weight),
        uom,
        productSensitivity,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Material added successfully.");
      setIsCreateModalVisible(false);
      setMaterialName("");
      setWeight("");
      setUom("Cartons");
      setProductSensitivity("Fragile");
      setNewOriginName("");
      setIsNewOrigin(false);

      // Refresh the origin points list
      fetchOriginPoints();
    } catch (error) {
      console.error("Error saving material:", error);
      Alert.alert("Error", "Failed to save material. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
   

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Existing Origin Points</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="orange" />
        ) : (
          originPoints.map((origin) => (
            <Pressable
              key={origin.id}
              style={styles.originItem}
              onPress={() => {
                setSelectedOrigin(origin); // Set the selected origin
                fetchMaterials(origin.id);
              }}
            >
              <Text style={styles.originText}>{origin.id}</Text>
            </Pressable>
          ))
        )}

        <Pressable
          style={styles.createButton}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Create Material</Text>
        </Pressable>
      </ScrollView>

      {/* Modal for Materials */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <Text style={styles.modalHeader}>Materials for {selectedOrigin?.id}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {materials.map((material) => (
              <View key={material.id} style={styles.materialItem}>
                <Text style={styles.materialText}>{material.name}</Text>
                <Text style={styles.materialText}>Weight: {material.weight} kg</Text>
                <Text style={styles.materialText}>UoM: {material.uom}</Text>
                <Text style={styles.materialText}>Sensitivity: {material.productSensitivity}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal for Create Material */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <Text style={styles.modalHeader}>Create Material</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.promptText}>Create for an existing origin point?</Text>
            <Pressable
              style={styles.toggleButton}
              onPress={() => setIsNewOrigin(!isNewOrigin)}
            >
              <Text style={styles.toggleButtonText}>
                {isNewOrigin ? "Use Existing Origin?" : "Create New Origin?"}
              </Text>
            </Pressable>

            {isNewOrigin ? (
              <TextInput
                style={styles.input}
                placeholder="Enter New Origin Name"
                placeholderTextColor={"#666"}
                value={newOriginName}
                onChangeText={(text) => setNewOriginName(text)}
              />
            ) : (
              <RNPickerSelect
                onValueChange={(value) => setSelectedOrigin(value)}
                items={originPoints.map((origin) => ({ label: origin.id, value: origin }))}
                placeholder={{ label: "Select Origin", value: null }}
                style={pickerSelectStyles}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Enter Material Name"
              placeholderTextColor={"#666"}
              value={materialName}
              onChangeText={(text) => setMaterialName(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter Material Weight (kg)"
              placeholderTextColor={"#666"}
              value={weight}
              onChangeText={(text) => setWeight(text)}
              keyboardType="numeric"
            />

            <RNPickerSelect
              onValueChange={(value) => setUom(value)}
              items={[
                { label: "Cartons", value: "Cartons" },
                { label: "Bags", value: "Bags" },
                { label: "Pieces", value: "Pieces" },
                { label: "Gallons", value: "Gallons" },
              ]}
              placeholder={{ label: "Select UoM", value: null }}
              style={pickerSelectStyles}
            />

            <RNPickerSelect
              onValueChange={(value) => setProductSensitivity(value)}
              items={[
                { label: "Fragile", value: "Fragile" },
                { label: "Flammable", value: "Flammable" },
                { label: "Non-Fragile", value: "Non-Fragile" },
              ]}
              placeholder={{ label: "Select Product Sensitivity", value: null }}
              style={pickerSelectStyles}
            />

            <Pressable
              style={styles.saveButton}
              onPress={handleSaveMaterial}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Material</Text>
              )}
            </Pressable>
          </ScrollView>
          <Pressable
            style={styles.closeButton}
            onPress={() => setIsCreateModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  originItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  originText: {
    fontSize: 16,
    color: "#333",
  },
  createButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    width: "40%",
    alignSelf: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  materialItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  materialText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    width: "40%",
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  promptText: {
    fontSize: 16,
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "black",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "40%",
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    color: "#333",
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    color: "#333",
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 16,
  },
  inputWeb: {
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
  },
});