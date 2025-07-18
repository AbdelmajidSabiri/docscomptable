import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen = ({ onNavigateBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    'Facture électricité',
    'Bon de livraison',
    'Justificatif paiement',
    'Devis client',
    'Reçu carburant'
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Mock documents data
  const allDocuments = [
    {
      id: 1,
      name: "Facture Fournisseur #001",
      type: "Achat",
      status: "pending",
      date: "2025-05-22",
      amount: "1,250.00 €",
      description: "Fournitures de bureau - Papeterie Centrale",
      tags: ["fournitures", "bureau", "papeterie"]
    },
    {
      id: 2,
      name: "Bon de livraison #045",
      type: "Vente",
      status: "processed",
      date: "2025-05-21",
      amount: "890.50 €",
      description: "Livraison client - Entreprise Martin",
      tags: ["livraison", "client", "vente"]
    },
    {
      id: 3,
      name: "Justificatif paiement",
      type: "Achat",
      status: "new",
      date: "2025-05-20",
      amount: "450.00 €",
      description: "Remboursement frais de déplacement",
      tags: ["remboursement", "déplacement", "frais"]
    },
    {
      id: 4,
      name: "Facture Électricité",
      type: "Achat",
      status: "processed",
      date: "2025-05-19",
      amount: "280.75 €",
      description: "EDF - Facture mensuelle bureau",
      tags: ["électricité", "edf", "utilities"]
    },
    {
      id: 5,
      name: "Devis Client #078",
      type: "Vente",
      status: "pending",
      date: "2025-05-18",
      amount: "2,150.00 €",
      description: "Prestation conseil - Société Durand",
      tags: ["devis", "conseil", "prestation"]
    },
    {
      id: 6,
      name: "Reçu Carburant",
      type: "Achat",
      status: "rejected",
      date: "2025-05-17",
      amount: "65.40 €",
      description: "Station Total - Véhicule de fonction",
      tags: ["carburant", "essence", "véhicule"]
    }
  ];

  const filterOptions = [
    { key: 'type_achat', label: 'Achat', type: 'type', value: 'Achat' },
    { key: 'type_vente', label: 'Vente', type: 'type', value: 'Vente' },
    { key: 'status_new', label: 'Nouveau', type: 'status', value: 'new' },
    { key: 'status_pending', label: 'En attente', type: 'status', value: 'pending' },
    { key: 'status_processed', label: 'Traité', type: 'status', value: 'processed' },
    { key: 'status_rejected', label: 'Rejeté', type: 'status', value: 'rejected' }
  ];

  const recentSearches = [
    { id: 1, query: 'facture électricité', results: 2 },
    { id: 2, query: 'bon de livraison', results: 1 },
    { id: 3, query: 'devis client', results: 3 }
  ];

  const suggestedSearches = [
    'Documents du mois',
    'Factures en attente',
    'Montant > 1000€',
    'Documents rejetés',
    'Achat carburant'
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, selectedFilters]);

  const performSearch = (query) => {
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      let results = allDocuments.filter(doc => {
        const matchesQuery = 
          doc.name.toLowerCase().includes(query.toLowerCase()) ||
          doc.description.toLowerCase().includes(query.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesFilters = selectedFilters.length === 0 || selectedFilters.some(filter => {
          const filterOption = filterOptions.find(opt => opt.key === filter);
          if (filterOption.type === 'type') {
            return doc.type === filterOption.value;
          } else if (filterOption.type === 'status') {
            return doc.status === filterOption.value;
          }
          return false;
        });
        
        return matchesQuery && matchesFilters;
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSearchHistoryPress = (historyItem) => {
    setSearchQuery(historyItem);
  };

  const handleRecentSearchPress = (search) => {
    setSearchQuery(search.query);
  };

  const handleSuggestedSearchPress = (suggestion) => {
    setSearchQuery(suggestion);
  };

  const clearSearchHistory = () => {
    Alert.alert(
      'Effacer l\'historique',
      'Voulez-vous vraiment effacer tout l\'historique de recherche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: () => setSearchHistory([]) }
      ]
    );
  };

  const toggleFilter = (filterKey) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterKey)) {
        return prev.filter(f => f !== filterKey);
      } else {
        return [...prev, filterKey];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

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

  const handleDocumentPress = (document) => {
    Alert.alert(
      'Détails du document',
      `${document.name}\n\nType: ${document.type}\nStatut: ${getStatusText(document.status)}\nMontant: ${document.amount}\nDate: ${document.date}\n\nDescription: ${document.description}`,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Ouvrir', onPress: () => Alert.alert('Ouvrir', 'Fonctionnalité d\'ouverture à implémenter') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C53030" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onNavigateBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.searchBarHeader}>
          <Ionicons name="search" size={20} color="#C53030" style={styles.searchIconHeader} />
          <TextInput
            style={styles.searchInputHeader}
            placeholder="Rechercher des documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButtonHeader}
            >
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      {selectedFilters.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {selectedFilters.map(filterKey => {
              const filter = filterOptions.find(opt => opt.key === filterKey);
              return (
                <TouchableOpacity
                  key={filterKey}
                  style={styles.activeFilterTag}
                  onPress={() => toggleFilter(filterKey)}
                >
                  <Text style={styles.activeFilterText}>{filter.label}</Text>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearFiltersText}>Tout effacer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Search Results */}
        {searchQuery.trim() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isSearching ? 'Recherche en cours...' : `Résultats (${searchResults.length})`}
              </Text>
              {searchResults.length > 0 && (
                <TouchableOpacity>
                  <Text style={styles.sortText}>Trier</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {searchResults.length === 0 && !isSearching ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#C7C7CC" />
                <Text style={styles.noResultsTitle}>Aucun résultat trouvé</Text>
                <Text style={styles.noResultsSubtitle}>
                  Essayez avec d'autres mots-clés ou ajustez vos filtres
                </Text>
              </View>
            ) : (
              searchResults.map((document) => (
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
        )}

        {/* Filters Section */}
        {!searchQuery.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filtres</Text>
            <View style={styles.filtersGrid}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    selectedFilters.includes(filter.key) && styles.filterChipActive
                  ]}
                  onPress={() => toggleFilter(filter.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedFilters.includes(filter.key) && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                  {selectedFilters.includes(filter.key) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" style={styles.filterCheckmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Searches */}
        {!searchQuery.trim() && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recherches récentes</Text>
              <TouchableOpacity onPress={() => Alert.alert('Effacer', 'Fonctionnalité d\'effacement à implémenter')}>
                <Text style={styles.clearText}>Effacer</Text>
              </TouchableOpacity>
            </View>
            
            {recentSearches.map((search) => (
              <TouchableOpacity
                key={search.id}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearchPress(search)}
              >
                <Ionicons name="time-outline" size={20} color="#8E8E93" />
                <View style={styles.recentSearchInfo}>
                  <Text style={styles.recentSearchText}>{search.query}</Text>
                  <Text style={styles.recentSearchResults}>{search.results} résultat{search.results !== 1 ? 's' : ''}</Text>
                </View>
                <Ionicons name="arrow-up-outline" size={16} color="#C7C7CC" style={styles.recentSearchIcon} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search History */}
        {!searchQuery.trim() && searchHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historique</Text>
              <TouchableOpacity onPress={clearSearchHistory}>
                <Text style={styles.clearText}>Effacer</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.historyContainer}>
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleSearchHistoryPress(item)}
                >
                  <Ionicons name="search" size={16} color="#8E8E93" />
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Suggested Searches */}
        {!searchQuery.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recherches suggérées</Text>
            <View style={styles.suggestionsContainer}>
              {suggestedSearches.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestedSearchPress(suggestion)}
                >
                  <Ionicons name="trending-up" size={16} color="#C53030" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#C7C7CC" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Tips */}
        {!searchQuery.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conseils de recherche</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Text style={styles.tipIconText}>💡</Text>
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Recherche par mots-clés</Text>
                  <Text style={styles.tipDescription}>Utilisez des mots-clés comme "facture", "devis", ou "électricité"</Text>
                </View>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Text style={styles.tipIconText}>🏷️</Text>
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Filtres avancés</Text>
                  <Text style={styles.tipDescription}>Combinez les filtres par type et statut pour affiner vos résultats</Text>
                </View>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Text style={styles.tipIconText}>📅</Text>
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Recherche par date</Text>
                  <Text style={styles.tipDescription}>Recherchez par mois comme "mai 2025" ou "cette semaine"</Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  searchBarHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIconHeader: {
    marginRight: 8,
  },
  searchInputHeader: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  clearButtonHeader: {
    marginLeft: 8,
  },
  activeFiltersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C53030',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  clearFiltersButton: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sortText: {
    fontSize: 14,
    color: '#C53030',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
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
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  filterChipActive: {
    backgroundColor: '#C53030',
    borderColor: '#C53030',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterCheckmark: {
    marginLeft: 6,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  recentSearchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentSearchText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  recentSearchResults: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recentSearchIcon: {
    transform: [{ rotate: '45deg' }],
  },
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  historyText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 6,
  },
  suggestionsContainer: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  tipsContainer: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipIconText: {
    fontSize: 18,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SearchScreen;