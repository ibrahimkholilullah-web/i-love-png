'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'PDF to JPG' },
    { href: '/fiverr-rewriter', label: 'Fiverr Rewriter' },
     { href: '/conversation', label: 'Message' },
  ];

  return (
    <header className="w-full bg-slate-950/100  border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl backdrop-blur-xl mx-auto px-6 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 font-black text-white text-base shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
            <span className="relative z-10">P</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-wide">
            PDF2JPG <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Pro</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-2 pb-4 space-y-2 transition-all duration-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}