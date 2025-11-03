import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useClaim } from '@/contexts/claim-context';
import { Photo, PhotoAngle } from '@/types';
import { Button } from '@/components/buttons';

const REQUIRED_ANGLES: { angle: PhotoAngle; label: string; icon: string }[] = [
  { angle: 'front', label: 'Front', icon: '📷' },
  { angle: 'rear', label: 'Rear', icon: '📷' },
  { angle: 'driver_side', label: 'Driver Side', icon: '📷' },
  { angle: 'passenger_side', label: 'Passenger Side', icon: '📷' },
  { angle: 'front_driver', label: 'Front Driver Corner', icon: '📷' },
  { angle: 'front_passenger', label: 'Front Passenger Corner', icon: '📷' },
  { angle: 'rear_driver', label: 'Rear Driver Corner', icon: '📷' },
  { angle: 'rear_passenger', label: 'Rear Passenger Corner', icon: '📷' },
];

export default function PhotoCaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { claims, addPhotos } = useClaim();
  const router = useRouter();

  const claim = claims.find((c) => c.id === id);
  const [photos, setPhotos] = useState<Map<PhotoAngle, Photo>>(new Map());

  useEffect(() => {
    requestPermissions();
    if (claim?.photos) {
      const photoMap = new Map();
      claim.photos.forEach((photo) => {
        photoMap.set(photo.angle, photo);
      });
      setPhotos(photoMap);
    }
  }, []);

  const requestPermissions = async () => {
    // Request both camera and media library permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' && libraryPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need access to your camera and photo library to capture damage photos. Please enable permissions in Settings.',
        [{ text: 'OK' }]
      );
    } else if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Camera Permission',
        'Camera access denied. You can still choose photos from your library.',
        [{ text: 'OK' }]
      );
    } else if (libraryPermission.status !== 'granted') {
      Alert.alert(
        'Photo Library Permission',
        'Photo library access denied. You can still take photos with the camera.',
        [{ text: 'OK' }]
      );
    }
  };

  const capturePhoto = async (angle: PhotoAngle) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const photo: Photo = {
          id: Math.random().toString(36).substr(2, 9),
          uri: asset.uri,
          angle,
          timestamp: new Date(),
          metadata: {
            width: asset.width,
            height: asset.height,
          },
        };

        setPhotos((prev) => new Map(prev).set(angle, photo));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const selectFromGallery = async (angle: PhotoAngle) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const photo: Photo = {
          id: Math.random().toString(36).substr(2, 9),
          uri: asset.uri,
          angle,
          timestamp: new Date(),
          metadata: {
            width: asset.width,
            height: asset.height,
          },
        };

        setPhotos((prev) => new Map(prev).set(angle, photo));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handlePhotoAction = (angle: PhotoAngle) => {
    const angleName = REQUIRED_ANGLES.find((a) => a.angle === angle)?.label;

    // On web, Alert doesn't work properly, so go straight to photo library
    if (Platform.OS === 'web') {
      console.log('Web platform detected, opening photo library for:', angleName);
      selectFromGallery(angle);
      return;
    }

    // On mobile, show dialog with both options
    Alert.alert(
      `${angleName} Photo`,
      'How would you like to add this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '📷 Take Photo',
          onPress: () => capturePhoto(angle),
          style: 'default'
        },
        {
          text: '🖼️ Choose from Photos',
          onPress: () => selectFromGallery(angle),
          style: 'default'
        },
      ],
      { cancelable: true }
    );
  };

  const handleContinue = async () => {
    if (photos.size < 4) {
      Alert.alert('More Photos Needed', 'Please capture at least 4 photos to continue.');
      return;
    }

    if (!id) return;

    await addPhotos(id, Array.from(photos.values()));
    router.push(`/(body-shop)/claim/${id}/damage-assessment`);
  };

  const progress = (photos.size / REQUIRED_ANGLES.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Capture Photos</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Tap any photo slot below to take a photo or choose from your library
          </Text>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: Colors.textSecondary + '30' }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: Colors.tint, width: `${progress}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
              {photos.size} of {REQUIRED_ANGLES.length} photos • Minimum 4 required
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {REQUIRED_ANGLES.map(({ angle, label, icon }) => {
            const photo = photos.get(angle);
            return (
              <TouchableOpacity
                key={angle}
                style={[
                  styles.photoSlot,
                  { borderColor: photo ? Colors.tint : Colors.textSecondary },
                  photo && { borderWidth: 3 },
                ]}
                onPress={() => handlePhotoAction(angle)}>
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderIcon}>{icon}</Text>
                    <Text style={[styles.placeholderText, { color: Colors.textSecondary }]}>
                      {label}
                    </Text>
                  </View>
                )}
                {photo && <View style={[styles.checkmark, { backgroundColor: Colors.tint }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.tipBox, { backgroundColor: '#f2f2f7' }]}>
          <Text style={[styles.tipTitle, { color: Colors.text }]}>📝 How to Add Photos</Text>
          <Text style={[styles.tipText, { color: Colors.textSecondary }]}>
            1. Tap any photo slot above{'\n'}
            2. Choose "📷 Take Photo" to use camera{'\n'}
            3. Or choose "🖼️ Choose from Photos" to upload{'\n'}
            4. Take photos in good lighting{'\n'}
            5. Get the entire vehicle in frame{'\n'}
            6. Minimum 4 photos, all 8 recommended
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: Colors.background, borderTopColor: Colors.border }]}>
        <Button
          title={photos.size >= 4 ? 'Continue to Analysis' : 'Add More Photos'}
          onPress={handleContinue}
          variant="primary"
          disabled={photos.size < 4}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoSlot: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipBox: {
    padding: 16,
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
});
