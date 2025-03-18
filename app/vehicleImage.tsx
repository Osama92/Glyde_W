import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Vehicle } from '../types'; // Import the Vehicle type

interface VehicleImageProps {
  selectedVehicle: Vehicle | null;
}

const VehicleImage: React.FC<VehicleImageProps> = ({ selectedVehicle }) => {
  return (
    <View style={styles.container}>
      {selectedVehicle && (
        <Animated.View
          key={selectedVehicle.id}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          layout={Layout.duration(500)}
        >
          <Image source={{ uri: selectedVehicle.imageUrl }} style={styles.image} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
});

export default VehicleImage;