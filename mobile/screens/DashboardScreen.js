import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
  Modal,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import DocumentScreen from './DocumentScreen';


const DashboardScreen = ({ onNavigateToDocuments ,onNavigateToProfile }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
 
  const [userInfo, setUserInfo] = useState({
    companyName: "ABC Corp",
    accountant: "Jean Dupont"
  });
  
  const [documentStats, setDocumentStats] = useState({
    pending: 5,
    processed: 23,
    rejected: 1,
    total: 29
  });

  const [recentDocuments, setRecentDocuments] = useState([
    {
      id: 1,
      name: "Facture Fournisseur #001",
      type: "Achat",
      status: "pending",
      date: "2025-05-22",
      amount: "1,250.00 €"
    },
    {
      id: 2,
      name: "Bon de livraison #045",
      type: "Vente",
      status: "processed",
      date: "2025-05-21",
      amount: "890.50 €"
    },
    {
      id: 3,
      name: "Justificatif paiement",
      type: "Achat",
      status: "new",
      date: "2025-05-20",
      amount: "450.00 €"
    }
  ]);

  useEffect(() => {
  requestPermissions();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return '#007AFF';
      case 'pending':
        return '#FF9500';
      case 'processed':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return 'Nouveau';
      case 'pending':
        return 'En attente';
      case 'processed':
        return 'Traité';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  const handleUploadDocument = () => {
  setUploadModalVisible(true);
  };
 

  const handleViewAllDocuments = () => {
    Alert.alert('View Documents', 'Document list functionality will be implemented here');
  };

  const handleDocumentPress = (document) => {
    Alert.alert('Document Details', `Viewing details for: ${document.name}`);
  };
  const requestPermissions = async () => {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
    Alert.alert(
      'Permissions requises',
      'L\'application a besoin d\'accéder à la caméra et à la galerie pour fonctionner correctement.'
    );
  }
};

const openCamera = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setUploadModalVisible(false);
      uploadDocument(result.assets[0]);
    }
  } catch (error) {
    Alert.alert('Erreur', 'Impossible d\'ouvrir la caméra');
    console.error('Camera error:', error);
  }
};

const openGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setUploadModalVisible(false);
      uploadDocument(result.assets[0]);
    }
  } catch (error) {
    Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie');
    console.error('Gallery error:', error);
  }
};

const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadModalVisible(false);
      uploadDocument(result.assets[0]);
    }
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de sélectionner le document');
    console.error('Document picker error:', error);
  }
};

const uploadDocument = async (file) => {
  setUploading(true);
  
  try {
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add the new document to recent documents
    const newDocument = {
      id: Date.now(),
      name: file.name || `Document_${Date.now()}`,
      type: 'Upload',
      status: 'new',
      date: new Date().toISOString().split('T')[0],
      amount: '0.00 €'
    };
    
    setRecentDocuments(prev => [newDocument, ...prev]);
    setDocumentStats(prev => ({
      ...prev,
      total: prev.total + 1
    }));
    
    Alert.alert('Succès', 'Document uploadé avec succès!');
  } catch (error) {
    Alert.alert('Erreur', 'Échec de l\'upload du document');
    console.error('Upload error:', error);
  } finally {
    setUploading(false);
    setSelectedImage(null);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C53030" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>{userInfo.companyName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Search', 'Search functionality will be implemented here')}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={onNavigateToProfile || (() => Alert.alert('Profile', 'Profile functionality will be implemented here'))}
          >
            <Ionicons name="person-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Enhanced Statistics Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Aperçu des documents</Text>
            <View style={styles.statsSubtitle}>
              <Ionicons name="trending-up" size={16} color="#C53030" />
              <Text style={styles.statsSubtitleText}>Activité du mois</Text>
            </View>
          </View>
          
          {/* Main Stats Card */}
          <View style={styles.mainStatCard}>
            <View style={styles.mainStatLeft}>
              <View style={styles.mainStatIconContainer}>
                <Ionicons name="document-text" size={32} color="#C53030" />
              </View>
              <View>
                <Text style={styles.mainStatNumber}>{documentStats.total}</Text>
                <Text style={styles.mainStatLabel}>Documents totaux</Text>
              </View>
            </View>
            <View style={styles.mainStatProgress}>
              <View style={styles.progressRing}>
                <Text style={styles.progressText}>+12%</Text>
              </View>
            </View>
          </View>

          {/* Secondary Stats Grid */}
          <View style={styles.secondaryStatsGrid}>
            <View style={[styles.statCard, styles.pendingCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="time-outline" size={20} color="#FF9500" />
                <View style={styles.statIndicator}>
                  <View style={[styles.statDot, { backgroundColor: '#FF9500' }]} />
                </View>
              </View>
              <Text style={styles.statNumber}>{documentStats.pending}</Text>
              <Text style={styles.statLabel}>En attente</Text>
              <Text style={styles.statChange}>+2 aujourd'hui</Text>
            </View>
            
            <View style={[styles.statCard, styles.processedCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
                <View style={styles.statIndicator}>
                  <View style={[styles.statDot, { backgroundColor: '#34C759' }]} />
                </View>
              </View>
              <Text style={styles.statNumber}>{documentStats.processed}</Text>
              <Text style={styles.statLabel}>Traités</Text>
              <Text style={styles.statChange}>+5 cette semaine</Text>
            </View>
          </View>

          <View style={styles.secondaryStatsGrid}>
            <View style={[styles.statCard, styles.rejectedCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                <View style={styles.statIndicator}>
                  <View style={[styles.statDot, { backgroundColor: '#FF3B30' }]} />
                </View>
              </View>
              <Text style={styles.statNumber}>{documentStats.rejected}</Text>
              <Text style={styles.statLabel}>Rejetés</Text>
              <Text style={styles.statChange}>Aucun nouveau</Text>
            </View>
            
            <View style={[styles.statCard, styles.efficiencyCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="analytics-outline" size={20} color="#C53030" />
                <View style={styles.statIndicator}>
                  <View style={[styles.statDot, { backgroundColor: '#C53030' }]} />
                </View>
              </View>
              <Text style={styles.statNumber}>94%</Text>
              <Text style={styles.statLabel}>Efficacité</Text>
              <Text style={styles.statChange}>+3% vs mois dernier</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={handleUploadDocument}
            >
              <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Déposer un document</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={onNavigateToDocuments} 

              >
                <Ionicons name="list" size={20} color="#C53030" />
                <Text style={styles.secondaryActionText}>Mes documents</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => Alert.alert('Search', 'Search functionality will be implemented here')}
              >
                <Ionicons name="search" size={20} color="#C53030" />
                <Text style={styles.secondaryActionText}>Rechercher</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents récents</Text>
            <TouchableOpacity onPress={handleViewAllDocuments}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {recentDocuments.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={styles.documentCard}
              onPress={() => handleDocumentPress(document)}
            >
              <View style={styles.documentIcon}>
                <Ionicons 
                  name="document-text" 
                  size={20} 
                  color={getStatusColor(document.status)} 
                />
              </View>
              
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{document.name}</Text>
                <Text style={styles.documentMeta}>
                  {document.type} • {document.date}
                </Text>
                <View style={styles.documentStatus}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(document.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(document.status) }
                  ]}>
                    {getStatusText(document.status)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.documentRight}>
                <Text style={styles.documentAmount}>{document.amount}</Text>
                <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accountant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre comptable</Text>
          <View style={styles.accountantCard}>
            <View style={styles.accountantIcon}>
              <Ionicons name="person" size={24} color="#C53030" />
            </View>
            <View style={styles.accountantInfo}>
              <Text style={styles.accountantName}>{userInfo.accountant}</Text>
              <Text style={styles.accountantLabel}>Comptable assigné</Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="mail" size={20} color="#C53030" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
  animationType="slide"
  transparent={true}
  visible={uploadModalVisible}
  onRequestClose={() => setUploadModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Ajouter un document</Text>
        <TouchableOpacity 
          onPress={() => setUploadModalVisible(false)}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.uploadOptions}>
        <TouchableOpacity style={styles.uploadOption} onPress={openCamera}>
          <View style={styles.uploadOptionIcon}>
            <Ionicons name="camera" size={32} color="#C53030" />
          </View>
          <Text style={styles.uploadOptionTitle}>Prendre une photo</Text>
          <Text style={styles.uploadOptionSubtitle}>Utilisez l'appareil photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.uploadOption} onPress={openGallery}>
          <View style={styles.uploadOptionIcon}>
            <Ionicons name="images" size={32} color="#C53030" />
          </View>
          <Text style={styles.uploadOptionTitle}>Depuis la galerie</Text>
          <Text style={styles.uploadOptionSubtitle}>Choisir une image existante</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
          <View style={styles.uploadOptionIcon}>
            <Ionicons name="document" size={32} color="#C53030" />
          </View>
          <Text style={styles.uploadOptionTitle}>Fichier</Text>
          <Text style={styles.uploadOptionSubtitle}>PDF, Word, Excel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

{/* Loading overlay */}
{uploading && (
  <Modal
    animationType="fade"
    transparent={true}
    visible={uploading}
  >
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#C53030" />
        <Text style={styles.loadingText}>Upload en cours...</Text>
      </View>
    </View>
  </Modal>
)}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#C53030',
    padding: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  statsSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsSubtitleText: {
    fontSize: 14,
    color: '#C53030',
    marginLeft: 6,
    fontWeight: '500',
  },
  mainStatCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  mainStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#C53030',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainStatNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#C53030',
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  mainStatProgress: {
    alignItems: 'center',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#C53030',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C53030',
  },
  secondaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  pendingCard: {
    backgroundColor: '#FFFBF0',
    borderColor: '#FED7AA',
  },
  processedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  rejectedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  efficiencyCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIndicator: {
    width: 8,
    height: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '400',
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#C53030',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#C53030',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  secondaryActionText: {
    color: '#C53030',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentRight: {
    alignItems: 'flex-end',
  },
  documentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  accountantCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  accountantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountantInfo: {
    flex: 1,
  },
  accountantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  accountantLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
},
modalContent: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: Platform.OS === 'ios' ? 34 : 20,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E5E7',
},
modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1A1A1A',
},
closeButton: {
  padding: 4,
},
uploadOptions: {
  padding: 20,
},
uploadOption: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  marginBottom: 12,
  backgroundColor: '#F8F9FA',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E5E7',
},
uploadOptionIcon: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#FFF5F5',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 16,
},
uploadOptionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1A1A1A',
  flex: 1,
},
uploadOptionSubtitle: {
  fontSize: 14,
  color: '#8E8E93',
  marginTop: 2,
},
loadingOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
loadingContent: {
  backgroundColor: '#FFFFFF',
  padding: 30,
  borderRadius: 16,
  alignItems: 'center',
  minWidth: 150,
},
loadingText: {
  marginTop: 16,
  fontSize: 16,
  color: '#1A1A1A',
  fontWeight: '500',
},
});

export default DashboardScreen;