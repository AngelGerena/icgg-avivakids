import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages, Home, ClipboardCheck, FileText, CalendarDays, Cake, Church, Heart, QrCode } from 'lucide-react';
import { ParentNotifications } from './ParentNotifications';
import { isMobileOrTablet } from '../utils/device';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  // The teacher portal broadcasts whether the "Escanear QR" button should show
  // (i.e. we're inside /admin and logged in). Keeps the button out of public pages.
  const [showScan, setShowScan] = useState(false);
  const [isMobile] = useState(() => isMobileOrTablet());
  useEffect(() => {
    const onState = (e: any) => setShowScan(!!(e.detail && e.detail.authed));
    window.addEventListener('avk:admin-auth', onState);
    return () => window.removeEventListener('avk:admin-auth', onState);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const navLinks = [
    { path: '/', label: t.nav.home, icon: Home, color: '#FFD000' },
    { path: '/check-in', label: t.nav.checkIn, icon: ClipboardCheck, color: '#4FC3F7' },
    { path: '/intake-form', label: t.nav.intakeForm, icon: FileText, color: '#FF8A8A' },
    { path: '/calendar', label: t.nav.calendar, icon: CalendarDays, color: '#00E0B8' },
    { path: '/birthdays', label: t.nav.birthdays, icon: Cake, color: '#D7A6F5' },
    { path: '/faith-at-home', label: language === 'es' ? 'Fe en Casa' : 'Faith at Home', icon: Heart, color: '#FF7EB6' },
  ];

  return (
    <>
      <nav className="avk-nav-bar sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-24">
            <Link to="/" aria-label="ICGG Aviva Kids" className="flex items-center flex-shrink-0 lg:ml-4">
              <img
                src="/images/aviva-kids-logo-nav.webp"
                alt="ICGG Aviva Kids"
                width={286}
                height={180}
                className="h-12 lg:h-20 w-auto object-contain drop-shadow-md select-none"
                draggable={false}
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1 bg-white/[0.06] rounded-full px-2 py-1.5 border border-white/[0.12] shadow-lg">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{ '--c': link.color } as React.CSSProperties}
                    className={`avk-nav-link flex items-center gap-2 px-4 py-2.5 rounded-full font-bold ${
                      active ? 'is-active bg-white text-kids-purple shadow-lg' : 'text-white'
                    }`}
                  >
                    <Icon className="avk-nav-icon w-5 h-5" />
                    <span className="text-sm whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}
              <a
                href="https://www.icgg.us"
                target="_blank"
                rel="noopener noreferrer"
                style={{ '--c': '#FFD000' } as React.CSSProperties}
                className="avk-nav-link flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-white"
              >
                <Church className="avk-nav-icon w-5 h-5" />
                <span className="text-sm whitespace-nowrap">Visite ICGG</span>
              </a>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 lg:mr-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 lg:space-x-2 bg-white px-2 py-1.5 lg:px-5 lg:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Languages className="w-4 h-4 lg:w-5 lg:h-5 text-kids-purple" />
                <span className="font-bold text-kids-purple text-sm lg:text-base">
                  {language === 'es' ? 'EN' : 'ES'}
                </span>
              </button>
              <div className="hidden lg:block">
                <ParentNotifications />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="avk-nav-bar lg:hidden fixed bottom-0 left-0 right-0 z-[100] shadow-[0_-6px_18px_rgba(0,0,0,0.25)] border-t border-white/10 pb-safe">
        <div className="grid grid-cols-6 gap-1 px-2 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{ '--c': link.color } as React.CSSProperties}
                className={`avk-tab flex flex-col items-center justify-center py-2 px-1 rounded-bubbly text-white transition-colors duration-300 ${
                  active ? 'is-active bg-white/[0.12]' : ''
                }`}
              >
                <Icon className="avk-nav-icon w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold text-center leading-tight">
                  {link.label}
                </span>
                {active && <span className="avk-tab-dot" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
