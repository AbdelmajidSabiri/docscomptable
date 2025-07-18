import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const DocumentPopup = ({ visible, onClose }) => {
  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) return Alert.alert('Error', response.errorMessage);
        console.log('Photo taken:', response.assets[0]);
        // You can now upload or store the photo
      }
    );
  };

  const handlePickDocument = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) return Alert.alert('Error', response.errorMessage);
        console.log('Document selected:', response.assets[0]);
        // You can now upload or store the file
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Déposer un document</Text>

          <TouchableOpacity style={styles.button} onPress={handlePickDocument}>
            <Text style={styles.buttonText}>📁 Importer depuis les fichiers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>📸 Prendre une photo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DocumentPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  close: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
});
