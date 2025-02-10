import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth';
import { PlayerProfileForm } from '../components/PlayerProfileForm';
import {
  User,
  Settings,
  MessageSquare,
  Calendar,
  LogOut,
} from 'lucide-react';

export function Dashboard() {
  const { profile, signOut } = useAuthStore();

  const menuItems = [
    { icon: User, label: 'Profile', path: 'profile' },
    { icon: MessageSquare, label: 'Messages', path: 'messages' },
    { icon: Calendar, label: 'Schedule', path: 'schedule' },
    { icon: Settings, label: 'Settings', path: 'settings' },
  ];

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-6 rounded-2xl h-fit"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-medium">{profile?.full_name || profile?.email}</h2>
                <p className="text-sm text-white/60 capitalize">{profile?.role}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-[#FF3366]"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<PlayerProfileForm />} />
              <Route path="/profile" element={<PlayerProfileForm />} />
              <Route
                path="/messages"
                element={
                  <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Messages</h2>
                    <p className="text-white/60">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/schedule"
                element={
                  <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Schedule</h2>
                    <p className="text-white/60">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/settings"
                element={
                  <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Settings</h2>
                    <p className="text-white/60">Coming soon...</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}