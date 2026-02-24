'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Building2, Shield, Save, X } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';
import CountryFlag from '@/components/CountryFlag';

const thailandOffice = {
  name: 'K Energy Save Co., Ltd.',
  address1: '84 Chaloem Phrakiat Rama 9 Soi 34',
  address2: 'Nong Bon, Prawet',
  city: 'Bangkok 10250, Thailand',
  phone: '+66 2 080 8916',
  email: 'info@kenergy-save.com',
  description: 'Smart Energy Management & IoT Solutions',
};

const koreaOffice = {
  name: 'Zera-Energy',
  address1: '2F, 16-10, 166beon-gil',
  address2: 'Elseso-ro, Gunpo-si',
  city: 'Gyeonggi-do, Korea',
  phone: '+82 31-427-1380',
  email: 'info@zera-energy.com',
  description: 'Korea Headquarters',
};

const adminUser = {
  name: 'System Administrator',
  email: 'admin@kenergysave.com',
  phone: '+82 (0)10-9876-5432',
  since: 'January 2020',
};

export default function ProfilePage() {
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [adminName, setAdminName] = useState(adminUser.name);
  const [adminEmail, setAdminEmail] = useState(adminUser.email);
  const [adminPhone, setAdminPhone] = useState(adminUser.phone);

  const notificationItems = [
    { key: 'emailNotifications', descKey: 'emailNotificationsDesc', checked: true },
    { key: 'smsNotifications', descKey: 'smsNotificationsDesc', checked: false },
    { key: 'systemAlerts', descKey: 'systemAlertsDesc', checked: true },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {t('myProfile') || 'My Profile'}
        </h1>
        <p className="text-gray-500 text-sm">
          {t('profileDescription') || 'Manage your account and company information'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <User className="w-14 h-14 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">{adminName}</h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-3">
                <Shield className="w-3 h-3" />
                {t('superAdmin') || 'Super Admin'}
              </span>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{t('memberSince') || 'Member since'} {adminUser.since}</span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('profileComplete') || 'Profile Complete'}</span>
                  <span className="font-semibold text-orange-600">100%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Thailand Office */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-sm p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <CountryFlag country="TH" size="md" />
              <div>
                <div className="font-bold text-base leading-tight">{thailandOffice.name}</div>
                <div className="text-orange-200 text-xs">Thailand Office</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-orange-100">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {thailandOffice.address1}<br />
                  {thailandOffice.address2}<br />
                  {thailandOffice.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-orange-100">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{thailandOffice.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-orange-100">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">{thailandOffice.email}</span>
              </div>
            </div>
          </div>

          {/* Korea Office */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-sm p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <CountryFlag country="KR" size="md" />
              <div>
                <div className="font-bold text-base leading-tight">{koreaOffice.name}</div>
                <div className="text-blue-200 text-xs">Korea Office</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-blue-100">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {koreaOffice.address1}<br />
                  {koreaOffice.address2}<br />
                  {koreaOffice.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{koreaOffice.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">{koreaOffice.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('personalInformation') || 'Personal Information'}
              </h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
                  <Edit className="w-4 h-4" />
                  {t('editProfile') || 'Edit Profile'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium">
                    <Save className="w-4 h-4" />
                    {t('saveChanges') || 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium">
                    <X className="w-4 h-4" />
                    {t('cancelEdit') || 'Cancel'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('fullName') || 'Full Name'}</label>
                {isEditing ? (
                  <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full p-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-gray-900 focus:outline-none focus:border-orange-400" />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{adminName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('role') || 'Role'}</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{t('superAdmin') || 'Super Admin'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('emailAddress') || 'Email Address'}</label>
                {isEditing ? (
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full p-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-gray-900 focus:outline-none focus:border-orange-400" />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{adminEmail}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('phoneNumber') || 'Phone Number'}</label>
                {isEditing ? (
                  <input type="tel" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} className="w-full p-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-gray-900 focus:outline-none focus:border-orange-400" />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{adminPhone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('department') || 'Department'}</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900">{t('itOperations') || 'IT & Operations'}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('companyAddress') || 'Company Address'}</label>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">
                    K Energy Save Co., Ltd.<br />
                    84 Chaloem Phrakiat Rama 9 Soi 34<br />
                    Nong Bon, Prawet, Bangkok 10250<br />
                    Thailand
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              {t('notificationSettings') || 'Notification Settings'}
            </h3>
            <div className="space-y-3">
              {notificationItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{t(item.key) || item.key}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t(item.descKey) || ''}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
