import { Text, View, TouchableOpacity, StyleSheet, Image, Alert, Dimensions, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';


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
          alert('Sorry, we need permissions to make this work!');
        }
      } catch (error) {
        console.log(error);
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
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
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
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
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

  /**
   * Navigate to results page with empty bill template for manual input
   */
  const handleManualInput = () => {
    const emptyBill = {
      items: [],
      subtotal: 0,
      tax: 0,
      tip: 0,
      total: 0,
      isManualInput: true
    };
    
    router.push({
      pathname: '/results',
      params: { bill: JSON.stringify(emptyBill) }
    });
  };

  /**
   * Display help information
   */
  const showHelp = () => {
    Alert.alert(
      "How to Use Flick2Split",
      "1. Take a photo of your bill or upload one from your gallery\n\n" +
      "2. Our app will automatically extract items and prices\n\n" +
      "3. Assign items to friends and split the bill fairly\n\n" +
      "If you don't have a bill to scan, use 'Enter Manually' or 'Split Evenly'",
      [{ text: "Got it!" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>FLICK</Text>
          <Text style={styles.yellowText}>2</Text>
          <Text style={styles.title}>SPLIT</Text>
        </View>
        <Text style={styles.tagline}>the best bill splitting app for friends</Text>
      </View>

      <TouchableOpacity 
        style={styles.helpButton}
        onPress={showHelp}
        activeOpacity={0.7}
      >
        <Ionicons name="help-circle" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            
            {/* Title at the top */}
            <View style={styles.previewTitleContainer}>
              <Text style={styles.previewText}>Receipt Preview</Text>
            </View>
            
            {/* Retake button at the bottom */}
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="refresh-outline" size={12} color="white" />
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
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>
                  {buttonState === "loading" ? "Processing..." : 
                   buttonState === "error" ? "Error" : "Take Photo"}
                </Text>
                {buttonState !== "loading" && buttonState !== "error" && (
                  <Ionicons name="camera" size={24} color="#3442C6" style={styles.buttonIcon} />
                )}
              </View>
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
            
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={handleManualInput}
              activeOpacity={0.7}
            >
              <Text style={styles.manualInputText}>Having trouble? Enter Manually</Text>
            </TouchableOpacity>
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

      {/* Fixed bottom button */}
      {!image && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.bottomFullButton}
            onPress={() => router.push('/split-evenly')}
            activeOpacity={0.8}
          >
            <View style={styles.bottomButtonContent}>
              <Ionicons name="people" size={22} color="white" style={styles.bottomButtonIcon} />
              <View style={styles.bottomButtonTextContainer}>
                <Text style={styles.bottomButtonText}>Split Evenly</Text>
                <Text style={styles.bottomButtonSubtext}>Everyone pays same amount</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
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
    marginTop: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 50,
    fontWeight: "900",
    color: "white",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    letterSpacing: 1.5,
  },
  yellowText: {
    fontSize: 60,
    fontWeight: "900",
    color: "#FFDF00", // Bright yellow color
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
    justifyContent: "flex-start",
    alignItems: "center",
    width: '100%',
    paddingTop: 25,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 35,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 25,
    marginTop: 45,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.02 }],
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    width: '90%',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  continueButton: {
    backgroundColor: "#4CDE80", // Green color for continue
    paddingVertical: 18, // Even shorter padding
    paddingHorizontal: 45, // Reduced padding further
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 8, // Reduced margin more
    width: '85%', // Kept the width
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
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3442C6",
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  continueButtonText: {
    fontSize: 20,
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
    marginTop: 0,
    marginBottom: 35,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
  },
  imagePreview: {
    width: '98%',
    aspectRatio: 2/3,
    minHeight: 280,
    maxHeight: 400,
    borderRadius: 18,
    marginBottom: 20,
    marginTop: 2,
    overflow: 'hidden',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 12,
      }
    }),
    position: 'relative',
    padding: 0,
    backgroundColor: 'transparent',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  retakeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 3,
  },
  previewText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  manualInputButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginTop: 10,
    marginBottom: 10,
    width: '65%',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  manualInputText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 5,
  },
  bottomFullButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    width: '84%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  bottomButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  bottomButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  buttonIcon: {
    marginLeft: 10,
  },
  helpButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bottomButtonIcon: {
    marginRight: 12,
  },
  bottomButtonTextContainer: {
    alignItems: 'flex-start',
  },
  previewTitleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
});
