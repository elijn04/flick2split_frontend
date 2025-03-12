import { Text, View, TouchableOpacity, StyleSheet, Image, Alert, Dimensions, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';


const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://flick2split-backend.onrender.com';

/**
 * Main app component for bill splitting application
 * Handles image capture, upload, and processing
 */
export default function Index() {
  const [buttonState, setButtonState] = useState("idle");
  const [image, setImage] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const router = useRouter();

  // Reset state on mount/unmount
  useEffect(() => {
    const resetState = () => {
      setImage(null);
      setButtonState("idle");
      setResponseData(null);
    };
    resetState();
    return resetState;
  }, []);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const [camera, media] = await Promise.all([
          ImagePicker.requestCameraPermissionsAsync(),
          ImagePicker.requestMediaLibraryPermissionsAsync()
        ]);
        
        if (camera.status !== 'granted' || media.status !== 'granted') {
          Alert.alert('Permissions needed', 'Camera and media library access is required for this app.');
        }
      } catch (error) {
        console.error('Permission request error:', error);
        Alert.alert('Permission Error', 'Failed to request permissions');
      }
    })();
  }, []);

  /**
   * Handles image capture/selection errors
   */
  const handleImageError = (error) => {
    console.log(error);
    setButtonState("error");
    setTimeout(() => setButtonState("idle"), 2000);
  };

  /**
   * Common image handling setup
   */
  const setupImageCapture = () => {
    setImage(null);
    setResponseData(null);
    setButtonState("loading");
  };

  /**
   * Launch camera to take photo
   */
  const takePhoto = async () => {
    setupImageCapture();
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled) setImage(result.assets[0].uri);
      setButtonState("idle");
    } catch (error) {
      handleImageError(error);
    }
  };

  /**
   * Launch image picker
   */
  const pickImage = async () => {
    setupImageCapture();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled) setImage(result.assets[0].uri);
      setButtonState("idle");
    } catch (error) {
      handleImageError(error);
    }
  };

  /**
   * Process image and navigate to results
   */
  const handleContinue = async () => {
    if (!image) return;
    setButtonState("processing");
    
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to server
      const response = await fetch(`${API_URL}/process-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = JSON.parse(await response.text());

      // Validate response data
      if (!data.bill?.items || !data.bill?.subtotal || isNaN(data.bill.subtotal) || data.bill.subtotal === 0) {
        throw new Error('Invalid bill data received');
      }

      setResponseData(data);
      router.push({
        pathname: '/results',
        params: { bill: JSON.stringify(data.bill) }
      });
      
      setButtonState("idle");
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.message.includes('Network request failed')
        ? `Cannot connect to server at ${API_URL}. Check if server is running.`
        : error.message || 'Network error or server unavailable';
      
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>FLICK2SPLIT</Text>
        <Text style={styles.tagline}>the best bill splitting app for friends</Text>
      </View>

      <View style={styles.content}>
        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={() => setImage(null)}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {!image ? (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                buttonState === "loading" && styles.buttonLoading,
                buttonState === "error" && styles.buttonError,
              ]}
              onPress={takePhoto}
              disabled={buttonState === "loading"}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {buttonState === "loading" ? "Processing..." : 
                 buttonState === "error" ? "Error" : "Take Photo"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                buttonState === "loading" && styles.buttonLoading,
                buttonState === "error" && styles.buttonError,
              ]}
              onPress={pickImage}
              disabled={buttonState === "loading"}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.instructions}>Snap a photo of your bill or upload one</Text>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.continueButton,
              buttonState === "processing" && styles.buttonProcessing,
              buttonState === "error" && styles.buttonError,
            ]}
            onPress={handleContinue}
            disabled={buttonState === "processing"}
            activeOpacity={0.8}
          >
            {buttonState === "processing" ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.continueButtonText}> Processing...</Text>
              </View>
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: "#3442C6", // Slightly darker blue
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(80, 130, 255, 0.3)',
    top: -width * 0.8,
    left: -width * 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(110, 80, 255, 0.2)',
    bottom: -width * 0.5,
    right: -width * 0.3,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "white",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 30,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
    transform: [{ scale: 1.02 }],
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
    width: '90%',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  continueButton: {
    backgroundColor: "#4CDE80", // Green color for continue
    paddingVertical: 30,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
    transform: [{ scale: 1.02 }],
  },
  buttonLoading: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  buttonProcessing: {
    backgroundColor: "rgba(76, 222, 128, 0.7)",
  },
  buttonError: {
    backgroundColor: "rgba(255, 100, 100, 0.9)",
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3442C6",
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  continueButtonText: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  imagePreview: {
    width: '90%',
    height: 220,
    borderRadius: 20,
    marginBottom: 30,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      }
    }),
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  retakeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  retakeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
