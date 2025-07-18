import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ onNavigateBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [userProfile, setUserProfile] = useState({
    companyName: "ABC Corp",
    siret: "12345678901234",
    contactName: "Marie Dubois",
    email: "marie.dubois@abccorp.com",
    phone: "+33 1 23 45 67 89",
    address: "123 Rue de la République",
    city: "Paris",
    postalCode: "75001",
    accountant: "Jean Dupont"
  });

  const [editableProfile, setEditableProfile] = useState({ ...userProfile });

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      setUserProfile({ ...editableProfile });
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } else {
      // Start editing
      setEditableProfile({ ...userProfile });
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setEditableProfile({ ...userProfile });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: onLogout || (() => {
          Alert.alert('Info', 'Fonctionnalité de déconnexion à implémenter');
        })}
      ]
    );
  };

  const ProfileField = ({ label, value, field, editable = true, keyboardType = 'default' }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.fieldInput}
          value={editableProfile[field]}
          onChangeText={(text) => setEditableProfile({ ...editableProfile, [field]: text })}
          keyboardType={keyboardType}
          placeholder={label}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C53030" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onNavigateBack}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "create"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="business" size={32} color="#C53030" />
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
            </View>
          </View>
          
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.companyName}>{userProfile.companyName}</Text>
            <Text style={styles.contactName}>{userProfile.contactName}</Text>
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.statusText}>Compte vérifié</Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={20} color="#C53030" />
            <Text style={styles.sectionTitle}>Informations de l'entreprise</Text>
          </View>
          
          <View style={styles.card}>
            <ProfileField 
              label="Raison sociale" 
              value={userProfile.companyName}
              field="companyName"
            />
            <ProfileField 
              label="SIRET" 
              value={userProfile.siret}
              field="siret"
              keyboardType="numeric"
            />
            <ProfileField 
              label="Nom du contact" 
              value={userProfile.contactName}
              field="contactName"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={20} color="#C53030" />
            <Text style={styles.sectionTitle}>Coordonnées</Text>
          </View>
          
          <View style={styles.card}>
            <ProfileField 
              label="Email" 
              value={userProfile.email}
              field="email"
              keyboardType="email-address"
            />
            <ProfileField 
              label="Téléphone" 
              value={userProfile.phone}
              field="phone"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#C53030" />
            <Text style={styles.sectionTitle}>Adresse</Text>
          </View>
          
          <View style={styles.card}>
            <ProfileField 
              label="Adresse" 
              value={userProfile.address}
              field="address"
            />
            <View style={styles.addressRow}>
              <View style={styles.addressFieldSmall}>
                <ProfileField 
                  label="Code postal" 
                  value={userProfile.postalCode}
                  field="postalCode"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.addressFieldLarge}>
                <ProfileField 
                  label="Ville" 
                  value={userProfile.city}
                  field="city"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Accountant Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#C53030" />
            <Text style={styles.sectionTitle}>Comptable assigné</Text>
          </View>
          
          <View style={styles.accountantCard}>
            <View style={styles.accountantIcon}>
              <Ionicons name="person" size={24} color="#C53030" />
            </View>
            <View style={styles.accountantInfo}>
              <Text style={styles.accountantName}>{userProfile.accountant}</Text>
              <Text style={styles.accountantLabel}>Comptable professionnel</Text>
            </View>
            <TouchableOpacity style={styles.contactAccountantButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#C53030" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={20} color="#C53030" />
            <Text style={styles.sectionTitle}>Paramètres</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications push</Text>
                <Text style={styles.settingDescription}>Recevoir les alertes sur l'appareil</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E5E7', true: '#C53030' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Alertes email</Text>
                <Text style={styles.settingDescription}>Recevoir les notifications par email</Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: '#E5E5E7', true: '#C53030' }}
                thumbColor={emailAlerts ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {isEditing && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={20} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={() => Alert.alert('Mot de passe', 'Fonctionnalité à implémenter')}
          >
            <Ionicons name="key-outline" size={20} color="#C53030" />
            <Text style={styles.changePasswordText}>Changer le mot de passe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FED7D7',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
  },
  profileHeaderInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  fieldInput: {
    fontSize: 16,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#C53030',
    paddingBottom: 8,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addressFieldSmall: {
    flex: 1,
  },
  addressFieldLarge: {
    flex: 2,
  },
  accountantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  contactAccountantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  changePasswordButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C53030',
  },
  changePasswordText: {
    color: '#C53030',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;