// Backend translation utility
// Supports: English (en), French (fr), Kinyarwanda (rw)

let currentLanguage = 'en';

const translations = {
  // Error messages
  noTokenProvided: { en: 'No token provided', fr: 'Aucun token fourni', rw: 'Nta token yoherejwe' },
  invalidToken: { en: 'Invalid token', fr: 'Token invalide', rw: 'Token si yo' },
  notFound: { en: 'Not found', fr: 'Non trouvé', rw: 'Ntabonetse' },
  internalServerError: { en: 'Internal server error', fr: 'Erreur interne du serveur', rw: 'Ikosa ryo mu seriveri' },
  emailAlreadyInUse: { en: 'Email already in use', fr: 'E-mail déjà utilisé', rw: 'Imeyili isanzwe ikoreshwa' },
  userRegisteredSuccessfully: { en: 'User registered successfully', fr: 'Utilisateur enregistré avec succès', rw: 'Umukoresha yanditswe neza' },
  invalidCredentials: { en: 'Invalid credentials', fr: 'Identifiants invalides', rw: 'Amakuru yo kwinjira si yo' },
  tenantNotFound: { en: 'Tenant not found', fr: 'Locataire non trouvé', rw: 'Umukodesha ntabonetse' },
  tenantDeleted: { en: 'Tenant deleted', fr: 'Locataire supprimé', rw: 'Umukodesha yasibwe' },
  propertyNotFound: { en: 'Property not found', fr: 'Propriété non trouvée', rw: 'Inzu ntabonetse' },
  propertyDeleted: { en: 'Property deleted', fr: 'Propriété supprimée', rw: 'Inzu yasibwe' },
  paymentNotFound: { en: 'Payment not found', fr: 'Paiement non trouvé', rw: 'Kwishyura ntabonetse' },
  paymentDeleted: { en: 'Payment deleted', fr: 'Paiement supprimé', rw: 'Kwishyura kwasibwe' },
  notificationNotFound: { en: 'Notification not found', fr: 'Notification non trouvée', rw: 'Itangazo ntabonetse' },
  notificationDeleted: { en: 'Notification deleted', fr: 'Notification supprimée', rw: 'Itangazo ryasibwe' },
  maintenanceRecordNotFound: { en: 'Maintenance record not found', fr: 'Enregistrement d\'entretien non trouvé', rw: 'Inyandiko yo kubungabunga ntabonetse' },
  maintenanceRecordDeleted: { en: 'Maintenance record deleted', fr: 'Enregistrement d\'entretien supprimé', rw: 'Inyandiko yo kubungabunga yasibwe' },
  complaintNotFound: { en: 'Complaint not found', fr: 'Plainte non trouvée', rw: 'Ikibazo ntabonetse' },
  complaintDeleted: { en: 'Complaint deleted', fr: 'Plainte supprimée', rw: 'Ikibazo gisasibwe' },
  
  // Validation messages
  nameRequired: { en: 'Name is required', fr: 'Le nom est requis', rw: 'Izina riba ngombwa' },
  validEmailRequired: { en: 'Valid email is required', fr: 'Un e-mail valide est requis', rw: 'Imeyili yo iba ngombwa' },
  passwordMinLength: { en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit contenir au moins 6 caractères', rw: 'Ijambo ryibanga rigomba kuba ririmo inyuguti 6' },
  roleRequired: { en: 'Role is required', fr: 'Le rôle est requis', rw: 'Uruhare ruba ngombwa' },
  passwordRequired: { en: 'Password is required', fr: 'Le mot de passe est requis', rw: 'Ijambo ryibanga riba ngombwa' },
  
  // Success messages
  operationSuccessful: { en: 'Operation completed successfully', fr: 'Opération terminée avec succès', rw: 'Igikorwa cyarangiye neza' },
  dataSaved: { en: 'Data saved successfully', fr: 'Données enregistrées avec succès', rw: 'Amakuru yabikwe neza' },
  dataUpdated: { en: 'Data updated successfully', fr: 'Données mises à jour avec succès', rw: 'Amakuru yahindutse neza' },
  dataDeleted: { en: 'Data deleted successfully', fr: 'Données supprimées avec succès', rw: 'Amakuru yasibwe neza' },
  
  // Database errors
  databaseConnectionError: { en: 'Database connection error', fr: 'Erreur de connexion à la base de données', rw: 'Ikosa ryo guhuza na database' },
  databaseQueryError: { en: 'Database query error', fr: 'Erreur de requête de base de données', rw: 'Ikosa ryo gusaba database' },
  
  // Authentication errors
  authenticationFailed: { en: 'Authentication failed', fr: 'Échec de l\'authentification', rw: 'Kwinjira ntibyashoboye' },
  unauthorizedAccess: { en: 'Unauthorized access', fr: 'Accès non autorisé', rw: 'Kwinjira nta bushobozi' },
  sessionExpired: { en: 'Session expired', fr: 'Session expirée', rw: 'Isaha yarangiye' },
  
  // File upload errors
  imageUploadError: { en: 'Failed to upload image', fr: 'Échec du téléchargement de l\'image', rw: 'Kutanga ifoto byanze' },
  fileTooLarge: { en: 'File is too large. Maximum size is 5MB', fr: 'Le fichier est trop volumineux. Taille maximale 5MB', rw: 'Dosiye ni nto. Uburebure bw\'ibisanzwe ni 5MB' },
  tooManyFiles: { en: 'Too many files uploaded', fr: 'Trop de fichiers téléchargés', rw: 'Dosiye nyinshi zatangijwe' },
  fileUploadError: { en: 'File upload error', fr: 'Erreur de téléchargement de fichier', rw: 'Ikosa ryo gutanga dosiye' },
  onlyImagesAllowed: { en: 'Only image files are allowed', fr: 'Seuls les fichiers image sont autorisés', rw: 'Dosiye z\'ifoto gusa zemerwa' },
  noImagesUploaded: { en: 'No images uploaded', fr: 'Aucune image téléchargée', rw: 'Nta foto yatangijwe' },
  imagesUploaded: { en: 'Images uploaded successfully', fr: 'Images téléchargées avec succès', rw: 'Ifoto zatangijwe neza' },
  imageDeleted: { en: 'Image deleted successfully', fr: 'Image supprimée avec succès', rw: 'Ifoto yasibwe neza' },
  propertyCreated: { en: 'Property created successfully', fr: 'Propriété créée avec succès', rw: 'Inzu yakozwe neza' },
  propertyUpdated: { en: 'Property updated successfully', fr: 'Propriété mise à jour avec succès', rw: 'Inzu yahindurwa neza' },
  
  // Network errors
  networkError: { en: 'Network error', fr: 'Erreur réseau', rw: 'Ikosa ryo mu urusobe' },
  connectionTimeout: { en: 'Connection timeout', fr: 'Délai de connexion dépassé', rw: 'Isaha yo guhuza yarangiye' },
  serverUnavailable: { en: 'Server unavailable', fr: 'Serveur indisponible', rw: 'Seriveri ntibikora' },
};

function t(key, lang = currentLanguage) {
  return translations[key]?.[lang] || translations[key]?.en || key;
}

function setLanguage(lang) {
  currentLanguage = lang;
}

function getLanguage() {
  return currentLanguage;
}

module.exports = {
  t,
  setLanguage,
  getLanguage,
  translations
}; 