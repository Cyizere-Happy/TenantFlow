import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Building, 
  Users, 
  DollarSign,
  ImageIcon,
  Upload,
  X,
  FileText,
  Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Property } from '../types';
import { formatCurrency } from '../utils/currency';
import { t } from '../utils/i18n';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Properties: React.FC = () => {
  const { 
    properties, 
    addProperty, 
    updateProperty, 
    deleteProperty, 
    loadProperties 
  } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get API base URL for image display
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const imageBaseUrl = apiBaseUrl.replace('/api', '') || 'http://localhost:4000';
  
  useEffect(() => {
    console.log('Properties component mounted, calling loadProperties');
    loadProperties();
  }, [loadProperties]);
  
  console.log('Properties component render - properties count:', properties.length);
  console.log('Properties data:', properties);
  
  // Debug: Check first property structure
  if (properties.length > 0) {
    console.log('First property:', properties[0]);
    console.log('First property ID:', properties[0]._id);
    console.log('First property ID type:', typeof properties[0]._id);
  }
  
  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${imageBaseUrl}${imagePath}`;
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const propertyData: any = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'house' | 'apartment' | 'commercial' | 'land',
      address: formData.get('address') as string,
      units: parseInt(formData.get('units') as string),
      rentPerUnit: parseFloat(formData.get('rentPerUnit') as string),
      image: selectedImage
    };
    
    try {
      if (editingProperty) {
        await updateProperty(editingProperty._id, propertyData);
      } else {
        await addProperty(propertyData);
      }
      
      setShowForm(false);
      setEditingProperty(null);
      setSelectedImage(null);
      setImagePreview(null);
      setError(null);
    } catch (error) {
      console.error('Error saving property:', error);
      setError(error instanceof Error ? error.message : t('failedToSaveProperty'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('Delete button clicked for property ID:', id);
    if (window.confirm(t('confirmDeleteProperty'))) {
      try {
        setError(null);
        console.log('Attempting to delete property:', id);
        await deleteProperty(id);
        console.log('Property deleted successfully');
      } catch (error) {
        console.error('Error deleting property:', error);
        setError(error instanceof Error ? error.message : t('failedToDeleteProperty'));
      }
    }
  };

  const handleEdit = (property: Property) => {
    console.log('Edit button clicked for property:', property);
    setEditingProperty(property);
    setShowForm(true);
    setError(null);
  };

  const handleExportPDF = () => {
    console.log('PDF export button clicked');
    console.log('Properties data:', properties);
    exportToPDF.properties(properties, 'Properties Report');
  };

  const handleExportExcel = () => {
    console.log('Excel export button clicked');
    console.log('Properties data:', properties);
    exportToExcel.properties(properties, 'properties-report.xlsx');
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('properties')}</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Export to PDF"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Export to Excel"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addProperty')}</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchProperties')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative">
              <img 
                src={getImageUrl(property.image)}
                alt={property.name}
                className="w-full h-48 object-cover"
                onError={handleImageError}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => handleEdit(property)}
                  className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors active:scale-95 cursor-pointer"
                  title="Edit Property"
                >
                  <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => handleDelete(property._id)}
                  className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors active:scale-95 cursor-pointer"
                  title="Delete Property"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{property.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{property.address}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('type')}</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{property.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('units')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{property.units}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('rentPerUnit')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(property.rentPerUnit, 'RWF')}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('totalValue')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(property.totalValue, 'RWF')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingProperty ? t('editProperty') : t('addProperty')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingProperty(null);
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('propertyImage')}
                  </label>
                  <div className="flex items-center space-x-4">
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                          onError={handleImageError}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600"
                      >
                        <ImageIcon className="h-5 w-5 mr-2" />
                        {t('chooseImage')}
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('propertyName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingProperty?.name}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Enter property name"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('type')}
                    </label>
                    <select
                      name="type"
                      required
                      defaultValue={editingProperty?.type}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    >
                      <option value="">{t('selectType')}</option>
                      <option value="house">{t('house')}</option>
                      <option value="apartment">{t('apartment')}</option>
                      <option value="commercial">{t('commercial')}</option>
                      <option value="land">{t('land')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    defaultValue={editingProperty?.address}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter property address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('numberOfUnits')}
                    </label>
                    <input
                      type="number"
                      name="units"
                      required
                      min="1"
                      defaultValue={editingProperty?.units}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Number of units"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('rentPerUnit')}
                    </label>
                    <input
                      type="number"
                      name="rentPerUnit"
                      required
                      min="0"
                      step="0.01"
                      defaultValue={editingProperty?.rentPerUnit}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Rent per unit"
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      editingProperty ? t('update') : t('add')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProperty(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;