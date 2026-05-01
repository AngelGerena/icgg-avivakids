import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages, Home, ClipboardCheck, FileText, CalendarDays, Cake, Church, Bell } from 'lucide-react';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const navLinks = [
    { path: '/', label: t.nav.home, icon: Home },
    { path: '/check-in', label: t.nav.checkIn, icon: ClipboardCheck },
    { path: '/intake-form', label: t.nav.intakeForm, icon: FileText },
    { path: '/calendar', label: t.nav.calendar, icon: CalendarDays },
    { path: '/birthdays', label: t.nav.birthdays, icon: Cake },
    { path: '/notifications', label: language === 'es' ? 'Alertas' : 'Alerts', icon: Bell },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-kids-yellow via-kids-blue to-kids-coral shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-24">
            <Link to="/" className="flex items-center space-x-2 lg:space-x-3 group lg:ml-4">
              <span className="text-kids-purple font-black text-lg lg:text-2xl transition-all duration-300 group-hover:scale-105 group-hover:tracking-wide drop-shadow-lg">
                ICGG AVIVA KIDS
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/20 shadow-lg">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all duration-300 overflow-hidden ${
                      isActive(link.path)
                        ? 'bg-white text-kids-purple shadow-lg transform scale-105'
                        : 'text-white hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive(link.path) ? 'scale-110' : 'group-hover:rotate-12'}`} />
                    <span className="relative z-10 text-sm whitespace-nowrap">{link.label}</span>
                    {isActive(link.path) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-kids-yellow/20 via-kids-blue/20 to-kids-coral/20 animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
              <a
                href="https://www.icgg.us"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all duration-300 overflow-hidden text-white hover:bg-white/20 hover:scale-105"
              >
                <Church className="w-5 h-5 transition-all duration-300 group-hover:rotate-12" />
                <span className="relative z-10 text-sm whitespace-nowrap">Visite ICGG</span>
              </a>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 lg:mr-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 lg:space-x-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 lg:px-5 lg:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 border border-white/50"
              >
                <Languages className="w-4 h-4 lg:w-5 lg:h-5 text-kids-purple transition-transform duration-300 hover:rotate-180" />
                <span className="font-bold text-kids-purple text-sm lg:text-base">
                  {language === 'es' ? 'EN' : 'ES'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-kids-yellow via-kids-blue to-kids-coral shadow-lg border-t-4 border-white/30 pb-safe backdrop-blur-sm">
        <div className="grid grid-cols-6 gap-1 px-2 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-bubbly transition-all duration-300 active:scale-95 ${
                  isActive(link.path)
                    ? 'bg-white text-kids-purple shadow-lg transform scale-105'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive(link.path) ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-semibold text-center leading-tight">
                  {link.label}
                </span>
              </Link>
            );
          })}
          <a
            href="https://www.icgg.us"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-bubbly transition-all duration-300 active:scale-95 text-white hover:bg-white/20"
          >
            <Church className="w-5 h-5 mb-1 transition-transform duration-300" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Visite ICGG
            </span>
          </a>
        </div>
      </div>
    </>
  );
};
