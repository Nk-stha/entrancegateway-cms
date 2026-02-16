'use client';

import { useState } from 'react';
import type { UserProfile } from './DashboardLayout.types';

interface HeaderProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export function Header({ userProfile, onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      {/* Search - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:flex flex-grow max-w-xl">
        <div className="relative w-full">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across dashboard..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none transition-all"
            style={{
              borderColor: 'var(--color-gray-200)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-brand-blue)';
              e.target.style.boxShadow = '0 0 0 1px var(--color-brand-blue)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-gray-200)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Mobile: Just show logo text */}
      <div className="md:hidden flex items-center">
        <span 
          className="font-bold text-lg font-roboto"
          style={{ color: 'var(--color-brand-navy)' }}
        >
          EntranceGateway
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications */}
        <button className="relative text-gray-500 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span 
            className="absolute top-0 right-0 block h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: 'var(--color-error)' }}
          ></span>
        </button>

        {/* Divider - Hidden on mobile */}
        <div className="hidden md:block h-8 w-px bg-gray-200"></div>

        {/* User Menu */}
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          {/* User info - Hidden on mobile */}
          <div className="hidden lg:block text-right">
            <p 
              className="text-sm font-bold leading-none"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              {userProfile.name}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{userProfile.role}</p>
          </div>
          
          {/* Avatar */}
          {userProfile.avatar ? (
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-transparent group-hover:border-brand-gold transition-colors"
            />
          ) : (
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 border-transparent group-hover:border-brand-gold transition-colors"
              style={{
                backgroundColor: 'var(--color-brand-gold)',
                color: 'var(--color-brand-navy)'
              }}
            >
              {userProfile.initials}
            </div>
          )}
          
          {/* Dropdown icon - Hidden on mobile */}
          <svg 
            className="hidden md:block w-5 h-5 text-gray-400 group-hover:text-brand-navy"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
