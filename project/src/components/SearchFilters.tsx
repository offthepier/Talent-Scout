import React from 'react';
import { Filter, ChevronDown, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayersStore } from '../store/players';

export function SearchFilters() {
  const { filters, setFilters, searchPlayers } = usePlayersStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPlayers();
  };

  const handleStatChange = (stat: string, value: number) => {
    setFilters({
      minStats: {
        ...filters.minStats,
        [stat]: value
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 z-40 glass-effect border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSearch}>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters({ query: e.target.value })}
                  placeholder="Search players..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors pl-10"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <motion.button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#FF6B6B] transition-colors"
            >
              Search
            </motion.button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Position</label>
                      <select
                        value={filters.position}
                        onChange={(e) => setFilters({ position: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                      >
                        <option value="">All Positions</option>
                        <option value="Forward">Forward</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Defender">Defender</option>
                        <option value="Goalkeeper">Goalkeeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1">Age Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={filters.minAge}
                          onChange={(e) => setFilters({ minAge: parseInt(e.target.value) })}
                          min="0"
                          max="100"
                          placeholder="Min"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                        />
                        <span className="text-white/60">-</span>
                        <input
                          type="number"
                          value={filters.maxAge}
                          onChange={(e) => setFilters({ maxAge: parseInt(e.target.value) })}
                          min="0"
                          max="100"
                          placeholder="Max"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1">Location</label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => setFilters({ location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="age">Age</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-sm text-white/60 hover:text-white flex items-center gap-2"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Advanced Filters
                      <ChevronDown className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-white/60 mb-1">Height Range (cm)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={filters.minHeight}
                                onChange={(e) => setFilters({ minHeight: parseInt(e.target.value) })}
                                min="0"
                                max="300"
                                placeholder="Min"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                              />
                              <span className="text-white/60">-</span>
                              <input
                                type="number"
                                value={filters.maxHeight}
                                onChange={(e) => setFilters({ maxHeight: parseInt(e.target.value) })}
                                min="0"
                                max="300"
                                placeholder="Max"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-1">Preferred Foot</label>
                            <select
                              value={filters.preferredFoot}
                              onChange={(e) => setFilters({ preferredFoot: e.target.value })}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                            >
                              <option value="">Any</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-white/60 mb-3">Minimum Stats</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Object.entries(filters.minStats).map(([stat, value]) => (
                              <div key={stat}>
                                <label className="block text-sm text-white/60 mb-1 capitalize">
                                  {stat}
                                </label>
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) => handleStatChange(stat, parseInt(e.target.value))}
                                  min="0"
                                  max="100"
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF3366] transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
}