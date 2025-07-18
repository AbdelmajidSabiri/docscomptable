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
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DocumentScreen = ({ onNavigateBack, onNavigateToSearch }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Facture Fournisseur #001",
      type: "Achat",
      status: "pending",
      date: "2025-05-22",
      amount: "1,250.00 €",
      description: "Fournitures de bureau - Papeterie Centrale"
    },
    {
      id: 2,
      name: "Bon de livraison #045",
      type: "Vente",
      status: "processed",
      date: "2025-05-21",
      amount: "890.50 €",
      description: "Livraison client - Entreprise Martin"
    },
    {
      id: 3,
      name: "Justificatif paiement",
      type: "Achat",
      status: "new",
      date: "2025-05-20",
      amount: "450.00 €",
      description: "Remboursement frais de déplacement"
    },
    {
      id: 4,
      name: "Facture Électricité",
      type: "Achat",
      status: "processed",
      date: "2025-05-19",
      amount: "280.75 €",
      description: "EDF - Facture mensuelle bureau"
    },
    {
      id: 5,
      name: "Devis Client #078",
      type: "Vente",
      status: "pending",
      date: "2025-05-18",
      amount: "2,150.00 €",
      description: "Prestation conseil - Société Durand"
    },
    {
      id: 6,
      name: "Reçu Carburant",
      type: "Achat",
      status: "rejected",
      date: "2025-05-17",
      amount: "65.40 €",
      description: "Station Total - Véhicule de fonction"
    },
    {
      id: 7,
      name: "Facture Télécom",
      type: "Achat",
      status: "processed",
      date: "2025-05-16",
      amount: "89.99 €",
      description: "Orange Business - Forfait mobile"
    },
    {
      id: 8,
      name: "Bon de commande #123",
      type: "Vente",
      status: "new",
      date: "2025-05-15",
      amount: "3,200.00 €",
      description: "Commande matériel informatique"
    }
  ]);

  const filterOptions = [
    { key: 'all', label: 'Tous', count: documents.length },
    { key: 'new', label: 'Nouveaux', count: documents.filter(d => d.status === 'new').length },
    { key: 'pending', label: 'En attente', count: documents.filter(d => d.status === 'pending').length },
    { key: 'processed', label: 'Traités', count: documents.filter(d => d.status === 'processed').length },
    { key: 'rejected', label: 'Rejetés', count: documents.filter(d => d.status === 'rejected').length }
  ];

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

  const getFilteredDocuments = () => {
    let filtered = documents;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === selectedFilter);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleDocumentPress = (document) => {
    Alert.alert(
      'Détails du document',
      `${document.name}\n\nType: ${document.type}\nStatut: ${getStatusText(document.status)}\nMontant: ${document.amount}\nDate: ${document.date}\n\nDescription: ${document.description}`,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Modifier', onPress: () => Alert.alert('Modifier', 'Fonctionnalité de modification à implémenter') }
      ]
    );
  };

  const handleUploadDocument = () => {
    Alert.alert('Déposer un document', 'Fonctionnalité de dépôt à implémenter');
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C53030" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onNavigateBack}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Mes Documents</Text>
            <Text style={styles.headerSubtitle}>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={onNavigateToSearch || (() => Alert.alert('Recherche', 'Fonctionnalité de recherche à implémenter'))}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleUploadDocument}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans vos documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.filterTabTextActive
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterBadge,
                selectedFilter === filter.key && styles.filterBadgeActive
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  selectedFilter === filter.key && styles.filterBadgeTextActive
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.documentsContainer}>
          {filteredDocuments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery.trim() ? 'Aucun résultat' : 'Aucun document'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery.trim() 
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Commencez par déposer votre premier document'
                }
              </Text>
              {!searchQuery.trim() && (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleUploadDocument}
                >
                  <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Déposer un document</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredDocuments.map((document) => (
              <TouchableOpacity
                key={document.id}
                style={styles.documentCard}
                onPress={() => handleDocumentPress(document)}
              >
                <View style={styles.documentIcon}>
                  <Ionicons 
                    name="document-text" 
                    size={24} 
                    color={getStatusColor(document.status)} 
                  />
                </View>
                
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{document.name}</Text>
                  <Text style={styles.documentDescription}>{document.description}</Text>
                  <View style={styles.documentMeta}>
                    <Text style={styles.documentMetaText}>
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
                </View>
                
                <View style={styles.documentRight}>
                  <Text style={styles.documentAmount}>{document.amount}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterTabActive: {
    backgroundColor: '#C53030',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 6,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E5E7',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterBadgeTextActive: {
    color: '#C53030',
  },
  content: {
    flex: 1,
  },
  documentsContainer: {
    padding: 16,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentMetaText: {
    fontSize: 12,
    color: '#8E8E93',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#C53030',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DocumentScreen;
