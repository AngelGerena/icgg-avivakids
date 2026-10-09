import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Users, BookOpen, Calendar, Baby, HandHeart, Sun, Moon, Sparkles, ArrowRight } from 'lucide-react';

export const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Heart,
      titleKey: 'safeEnvironment',
      descKey: 'safeEnvironmentDesc',
      color: 'kids-coral',
      hex: '#FF6B6B',
    },
    {
      icon: BookOpen,
      titleKey: 'bibleTeaching',
      descKey: 'bibleTeachingDesc',
      color: 'kids-blue',
      hex: '#4FC3F7',
    },
    {
      icon: Users,
      titleKey: 'ageGroups',
      descKey: 'ageGroupsDesc',
      color: 'kids-mint',
      hex: '#00C9A7',
    },
  ];

  const ageGroups: { icon: typeof Baby; titleKey: 'babies' | 'explorers' | 'adventurers'; color: string; hex: string; image: string }[] = [
    {
      icon: Baby,
      titleKey: 'babies',
      color: 'kids-yellow',
      hex: '#FFC400',
      image: 'https://images.pexels.com/photos/3661383/pexels-photo-3661383.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      icon: Users,
      titleKey: 'explorers',
      color: 'kids-coral',
      hex: '#FF6B6B',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      icon: Calendar,
      titleKey: 'adventurers',
      color: 'kids-blue',
      hex: '#4FC3F7',
      image: 'https://images.pexels.com/photos/8612990/pexels-photo-8612990.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[600px] mb-16"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Happy children"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B2452]/85 via-[#4A1F78]/70 to-[#8A4CC4]/60"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl h-full flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="-mb-12"
          >
            <motion.img
              src="/Vibrant_kids_logo_design.png"
              alt="Aviva Kids Logo"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-80 h-80 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl"
          >
            {t.home.welcome}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg"
          >
            {t.home.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="avk-nav-bar text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed rounded-bubbly p-6 shadow-xl border border-white/10"
          >
            {t.home.missionStatement}
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto max-w-6xl relative z-10 px-4 pb-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="avk-title text-4xl md:text-5xl text-center mb-10">
            {t.home.whatWeOffer}
            <span className="avk-title-bar" aria-hidden="true" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                style={{ '--c': feature.hex } as React.CSSProperties}
                className="avk-panel avk-panel-stripe rounded-bubbly p-8"
              >
                <div
                  className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: feature.hex, boxShadow: `0 0 24px ${feature.hex}80` }}
                >
                  <feature.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-white text-center mb-3">
                  {t.home[feature.titleKey as keyof typeof t.home]}
                </h3>
                <p className="text-white/85 text-center leading-relaxed font-medium">
                  {t.home[feature.descKey as keyof typeof t.home]}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="avk-title text-4xl md:text-5xl text-center mb-10">
            {t.home.ourAgeGroups}
            <span className="avk-title-bar" aria-hidden="true" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ageGroups.map((group, index) => (
              <motion.div
                key={group.titleKey}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.08 }}
                className={`relative overflow-hidden rounded-bubbly shadow-[0_22px_44px_-18px_rgba(42,30,87,0.65)] border-4 border-${group.color} text-center h-72`}
              >
                <div className="absolute inset-0">
                  <img
                    src={group.image}
                    alt={t.checkIn.rooms[group.titleKey]}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, rgba(27,36,82,0.96) 0%, rgba(42,30,87,0.7) 42%, ${group.hex}66 100%)` }}
                  ></div>
                </div>
                <div className="relative z-10 flex flex-col items-center justify-end h-full pb-6 px-4">
                  <div className="w-14 h-14 mb-3 rounded-full flex items-center justify-center shadow-lg" style={{ background: group.hex }}>
                    <group.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg text-center leading-tight">
                    {t.checkIn.rooms[group.titleKey]}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Link
            to="/volunteer"
            className="group relative block overflow-hidden rounded-bubbly bg-gradient-to-r from-kids-coral via-kids-purple to-kids-blue p-8 sm:p-10 shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(155,89,182,0.6)] transition-shadow"
          >
            <div className="absolute -top-16 -left-10 w-56 h-56 bg-kids-yellow/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-kids-mint/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full flex items-center justify-center shadow-xl"
              >
                <HandHeart className="w-14 h-14 sm:w-16 sm:h-16 text-kids-coral" />
              </motion.div>
              <div className="flex-1 text-white">
                <p className="inline-block bg-kids-yellow text-gray-900 text-xs sm:text-sm font-black uppercase tracking-wider rounded-full px-4 py-1 mb-3 shadow">
                  {t.home.volunteerBadge}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 drop-shadow-lg">
                  {t.home.volunteerTitle}
                </h2>
                <p className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-white/95 max-w-2xl">
                  {t.home.volunteerDesc}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold">
                    <Sun className="w-4 h-4" />{t.home.volunteerSundays}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold">
                    <Moon className="w-4 h-4" />{t.home.volunteerThursdays}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold">
                    <Sparkles className="w-4 h-4" />{t.home.volunteerEvents}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-2 bg-white text-kids-purple text-lg sm:text-xl font-black rounded-full px-7 py-4 shadow-xl group-hover:scale-110 group-hover:bg-kids-yellow group-hover:text-gray-900 transition-all">
                  {t.home.volunteerButton}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#4A1F78] via-[#3B3590] to-[#0B6FA8] rounded-bubbly p-10 shadow-2xl text-white text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t.home.firstTimeTitle}
          </h2>
          <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto leading-relaxed">
            {t.home.firstTimeDesc}
          </p>
          <div className="bg-[#1B2452]/45 border border-white/15 rounded-bubbly p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black mb-3">{t.home.checkInProcess}</h3>
            <ol className="text-left space-y-2 text-lg">
              <li className="flex items-start">
                <span className="font-black mr-2">1.</span>
                <span>{t.home.step1}</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-2">2.</span>
                <span>{t.home.step2}</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-2">3.</span>
                <span>{t.home.step3}</span>
              </li>
              <li className="flex items-start">
                <span className="font-black mr-2">4.</span>
                <span>{t.home.step4}</span>
              </li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
