import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { label: 'Players', path: '/players' },
    { label: 'Scouts', path: '/scouts' },
    { label: 'Clubs', path: '/clubs' },
    { label: 'About', path: '/about' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed w-full top-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link to="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold gradient-text"
            >
              TALENT SCOUT
            </motion.div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-12">
            {menuItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm tracking-widest hover:text-[#FF3366] transition-colors ${
                  location.pathname === item.path ? 'text-[#FF3366]' : 'text-white'
                }`}
              >
                {item.label.toUpperCase()}
              </Link>
            ))}
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:text-[#FF3366] transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm border border-white/10 rounded-full hover:bg-white/5"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="px-6 py-2 bg-[#FF3366] text-white rounded-full text-sm font-medium hover:bg-[#FF6B6B] transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden glass"
        >
          <div className="px-4 py-6 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 text-sm hover:text-[#FF3366] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm hover:text-[#FF3366] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:text-[#FF3366] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-4 py-2 text-sm hover:text-[#FF3366] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}