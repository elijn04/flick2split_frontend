import { Text, View, TouchableOpacity, StyleSheet, Image, Alert, Dimensions, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.58:5001';

export default function Index() {
  const [buttonState, setButtonState] = useState("idle"); // idle, loading, error, processing
  const [image, setImage] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const router = useRouter();

  // Add cleanup effect when component mounts or when navigating back
  useEffect(() => {
    const cleanup = () => {
      setImage(null);
      setButtonState("idle");
      setResponseData(null);
    };
    
    cleanup(); // Clean up when mounting
    return cleanup; // Clean up when unmounting
  }, []);

  // Request camera and media library permissions
  useEffect(() => {
    (async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
        Alert.alert('Permissions needed', 'Camera and media library access is required for this app.');
      }
    })();
  }, []);

  const takePhoto = async () => {
    setImage(null); // Clear previous image
    setResponseData(null); // Clear previous response
    setButtonState("loading");
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
      setButtonState("idle");
    } catch (error) {
      console.log(error);
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
    }
  };

  const pickImage = async () => {
    setImage(null); // Clear previous image
    setResponseData(null); // Clear previous response
    setButtonState("loading");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
      setButtonState("idle");
    } catch (error) {
      console.log(error);
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
    }
  };

  const handleContinue = async () => {
    if (!image) return;
    
    setButtonState("processing");
    try {
      console.log('Starting image processing...');
      console.log('Image URI:', image);
      
      const base64Image = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Base64 image length:', base64Image.length);
      
      console.log('Sending request to:', `${API_URL}/process-bill`);
      const response = await fetch(`${API_URL}/process-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      // Validate the bill data structure
      if (!data.bill || !data.bill.items || !data.bill.subtotal) {
        console.error('Invalid bill data:', data);
        Alert.alert(
          "Processing Error",
          "Could not process the bill correctly. Please try taking the photo again with better lighting and alignment.",
          [{ text: "OK" }]
        );
        setButtonState("error");
        return;
      }

      // Validate numeric values
      if (isNaN(data.bill.subtotal) || data.bill.subtotal === 0) {
        console.error('Invalid subtotal:', data.bill.subtotal);
        Alert.alert(
          "Invalid Bill Data",
          "The bill subtotal appears to be invalid. Please try again.",
          [{ text: "OK" }]
        );
        setButtonState("error");
        return;
      }

      setResponseData(data);
      router.push({
        pathname: '/results',
        params: { bill: JSON.stringify(data.bill) }
      });
      
      setButtonState("idle");
    } catch (error) {
      console.error('Detailed error:', error);
      let errorMessage = 'Network error or server unavailable';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = `Cannot connect to server at ${API_URL}. Check if server is running.`;
      }
      
      Alert.alert(
        "Error",
        errorMessage,
        [{ text: "OK" }]
      );
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
    }
  };

  // Add a test connection function
  const testConnection = async () => {
    try {
      Alert.alert('Testing', `Connecting to ${API_URL}/test...`);
      const response = await fetch(`${API_URL}/test`);
      const data = await response.json();
      Alert.alert('Connection Test', data.message);
    } catch (error) {
      Alert.alert('Connection Error', `Failed to connect: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.testButton}
        onPress={testConnection}
      >
        <Text style={styles.testButtonText}>Test Connection</Text>
      </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
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
  testButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    zIndex: 10,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
