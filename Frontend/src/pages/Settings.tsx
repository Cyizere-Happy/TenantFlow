import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  DollarSign, 
  Clock,
  Mail,
  Save,
  Bell
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/currency';
import { t, setLanguage } from '../utils/i18n';
import { toast } from 'react-toastify';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);
  
  useEffect(() => {
    setLanguage(formData.language as any);
  }, [formData.language]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    
    // Apply dark mode immediately
    if (formData.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(t('save') + ' ✔');
  };
  
  const handleChange = (key: keyof typeof settings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg">
              <SettingsIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('currency')}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="RWF">RWF - {t('rwandanFranc')}</option>
                  <option value="USD">USD - {t('usDollar')}</option>
                  <option value="EUR">EUR - {t('euro')}</option>
                  <option value="GBP">GBP - {t('britishPound')}</option>
                  <option value="CAD">CAD - {t('canadianDollar')}</option>
                  <option value="AUD">AUD - {t('australianDollar')}</option>
                  <option value="KES">KES - {t('kenyanShilling')}</option>
                  <option value="UGX">UGX - {t('ugandanShilling')}</option>
                  <option value="TZS">TZS - {t('tanzanianShilling')}</option>
                </select>
              </div>
              {/* Currency Preview */}
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('currency')} {t('preview')}:</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(1300000, formData.currency)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('sampleAmount')}: {formatCurrency(1300000, 'RWF')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 {t('allAmountsStored')}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('language')}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="en">{t('english')}</option>
                  <option value="fr">{t('french')}</option>
                  <option value="rw">{t('kinyarwanda')}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timezone')}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="Africa/Kigali">{t('kigali')}</option>
                  <option value="America/New_York">{t('easternTime')}</option>
                  <option value="America/Chicago">{t('centralTime')}</option>
                  <option value="America/Denver">{t('mountainTime')}</option>
                  <option value="America/Los_Angeles">{t('pacificTime')}</option>
                  <option value="Europe/London">{t('london')}</option>
                  <option value="Europe/Paris">{t('paris')}</option>
                  <option value="Asia/Tokyo">{t('tokyo')}</option>
                  <option value="Australia/Sydney">{t('sydney')}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rentReminder')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.rentReminderFrequency}
                onChange={(e) => handleChange('rentReminderFrequency', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
              {formData.darkMode ? (
                <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <Sun className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('darkMode')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('darkMode')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('switchBetweenLightAndDarkTheme')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('darkMode', !formData.darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('notifications')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('notifications')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('receiveNotificationsViaEmail')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('emailNotifications', !formData.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.emailNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{t('save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;