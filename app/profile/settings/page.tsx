'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SettingCard from '@/components/settings/SettingCard';
import ProfileField from '@/components/settings/ProfileField';
import { User, Lock, Bell, LogOut } from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Developer',
    email: 'john.developer@example.com',
    phone: '+1 (555) 123-4567',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailUpdates: true,
    meetingReminders: true,
    investorMessages: true,
    weeklyDigest: false,
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setSuccessMessage('Profile updated successfully!');
    setIsEditingProfile(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleNotificationChange = (
    key: keyof typeof notificationPrefs
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePassword = () => {
    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      alert('Passwords do not match');
      return;
    }
    setSuccessMessage('Password changed successfully!');
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✓ {successMessage}</p>
        </div>
      )}

      {/* Profile Information Section */}
      <SettingCard
        title="Profile Information"
        description="Update your personal details"
        icon="👤"
        action={{
          label: isEditingProfile ? 'Cancel' : 'Edit',
          onClick: () => setIsEditingProfile(!isEditingProfile),
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField
            label="First Name"
            value={profileData.firstName}
            isEditing={isEditingProfile}
            onChange={(value) => handleProfileChange('firstName', value)}
          />
          <ProfileField
            label="Last Name"
            value={profileData.lastName}
            isEditing={isEditingProfile}
            onChange={(value) => handleProfileChange('lastName', value)}
          />
          <ProfileField
            label="Email"
            value={profileData.email}
            type="email"
            isEditing={isEditingProfile}
            onChange={(value) => handleProfileChange('email', value)}
          />
          <ProfileField
            label="Phone"
            value={profileData.phone}
            type="tel"
            isEditing={isEditingProfile}
            onChange={(value) => handleProfileChange('phone', value)}
          />
        </div>
        {isEditingProfile && (
          <button
            onClick={handleSaveProfile}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save Changes
          </button>
        )}
      </SettingCard>

      {/* Account Security Section */}
      <SettingCard
        title="Account Security"
        description="Manage your password and security settings"
        icon="🔒"
        action={{
          label: showPasswordForm ? 'Cancel' : 'Change Password',
          onClick: () => setShowPasswordForm(!showPasswordForm),
        }}
      >
        {showPasswordForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSavePassword}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              ✓ Your account is secure. Last password change: 90 days ago.
            </p>
          </div>
        )}
      </SettingCard>

      {/* Notification Preferences Section */}
      <SettingCard
        title="Notification Preferences"
        description="Control how you receive notifications"
        icon="🔔"
      >
        <div className="space-y-4">
          {Object.entries(notificationPrefs).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  handleNotificationChange(
                    key as keyof typeof notificationPrefs
                  )
                }
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-900">
                {key === 'emailUpdates'
                  ? 'Email Updates'
                  : key === 'meetingReminders'
                  ? 'Meeting Reminders'
                  : key === 'investorMessages'
                  ? 'Investor Messages'
                  : 'Weekly Digest'}
              </span>
            </label>
          ))}
        </div>
      </SettingCard>

      {/* Danger Zone - Logout/Delete Account */}
      <SettingCard
        title="Danger Zone"
        description="Irreversible actions"
        icon="⚠️"
      >
        <div className="space-y-3">
          <button className="w-full px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <button className="w-full px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </SettingCard>
    </DashboardLayout>
  );
}
