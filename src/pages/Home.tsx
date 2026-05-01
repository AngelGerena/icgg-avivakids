import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Shield, Users, BookOpen, Calendar, Baby } from 'lucide-react';

export const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Heart,
      titleKey: 'safeEnvironment',
      descKey: 'safeEnvironmentDesc',
      color: 'kids-coral',
    },
    {
      icon: BookOpen,
      titleKey: 'bibleTeaching',
      descKey: 'bibleTeachingDesc',
      color: 'kids-blue',
    },
    {
      icon: Users,
      titleKey: 'ageGroups',
      descKey: 'ageGroupsDesc',
      color: 'kids-mint',
    },
  ];

  const ageGroups = [
    {
      icon: Baby,
      titleKey: 'babies',
      color: 'kids-yellow',
      image: 'https://images.pexels.com/photos/3661383/pexels-photo-3661383.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      icon: Users,
      titleKey: 'explorers',
      color: 'kids-coral',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      icon: Calendar,
      titleKey: 'adventurers',
      color: 'kids-blue',
      image: 'https://images.pexels.com/photos/8612990/pexels-photo-8612990.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      icon: Shield,
      titleKey: 'youth',
      color: 'kids-mint',
      image: '/TEENS.webp',
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
          <div className="absolute inset-0 bg-gradient-to-b from-kids-purple/80 via-kids-blue/70 to-kids-mint/60"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl h-full flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="-mb-12"
          >
            <motion.img
              src="/Vibrant_kids_logo_design.webp"
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
            className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 drop-shadow-2xl text-center leading-tight"
          >
            {[
              { text: '¡Bienvenidos', color: 0 },
              { text: ' ', color: -1 },
              { text: 'a', color: 5 },
              { text: ' ', color: -1 },
              { text: 'ICGG', color: 2 },
              { text: ' ', color: -1 },
              { text: 'Aviva', color: 7 },
              { text: ' ', color: -1 },
              { text: 'Kids!', color: 1 },
            ].map((word, wi) => {
              const colors = ['#FFD700', '#FF6B6B', '#4FC3F7', '#69F0AE', '#CE93D8', '#FF9800', '#00E5FF', '#E91E63'];
              if (word.text === ' ') return <span key={wi}>&nbsp;</span>;
              return (
                <span key={wi} style={{ display: 'inline-block', marginRight: '0.15em' }}>
                  {word.text.split('').map((letter, li) => (
                    <motion.span
                      key={li}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + (wi * 5 + li) * 0.03 }}
                      style={{
                        color: colors[(word.color + li) % colors.length],
                        WebkitTextStroke: '1.5px rgba(0,0,0,0.3)',
                        display: 'inline-block',
                        textShadow: '2px 3px 0px rgba(0,0,0,0.25)',
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              );
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              color: '#AAFF00',
              WebkitTextStroke: '1px rgba(0,0,0,0.5)',
              textShadow: '2px 3px 6px rgba(0,0,0,0.4)',
            }}
            className="text-xl sm:text-2xl md:text-3xl font-black mb-6"
          >
            {t.home.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-lg bg-kids-purple/40 backdrop-blur-sm rounded-bubbly p-6"
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
          <h2 className="text-4xl font-black text-kids-purple text-center mb-10">
            {t.home.whatWeOffer}
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
                className={`bg-white rounded-bubbly p-8 shadow-xl border-4 border-${feature.color}`}
              >
                <feature.icon className={`w-16 h-16 text-${feature.color} mx-auto mb-4`} />
                <h3 className="text-2xl font-black text-gray-800 text-center mb-3">
                  {t.home[feature.titleKey]}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {t.home[feature.descKey]}
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
          <h2 className="text-4xl font-black text-kids-purple text-center mb-10">
            {t.home.ourAgeGroups}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ageGroups.map((group, index) => {
              const cardStyles = [
                {
                  // Yellow card — violet complements yellow
                  topColor: 'rgba(255,213,0,0.55)',
                  bottomColor: 'rgba(180,140,0,0.92)',
                  iconColor: '#4A00BF',
                  textColor: '#3A0099',
                },
                {
                  // Coral/red card — deep teal complements coral
                  topColor: 'rgba(255,100,90,0.55)',
                  bottomColor: 'rgba(180,40,30,0.92)',
                  iconColor: '#00695C',
                  textColor: '#004D40',
                },
                {
                  // Blue card — amber complements blue
                  topColor: 'rgba(79,195,247,0.55)',
                  bottomColor: 'rgba(20,100,180,0.92)',
                  iconColor: '#FF8F00',
                  textColor: '#E65100',
                },
                {
                  // Teal/mint card — magenta complements teal
                  topColor: 'rgba(77,208,174,0.55)',
                  bottomColor: 'rgba(0,105,92,0.92)',
                  iconColor: '#AD1457',
                  textColor: '#880E4F',
                },
              ];
              const style = cardStyles[index % cardStyles.length];
              return (
                <motion.div
                  key={group.titleKey}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.08 }}
                  className={`relative overflow-hidden rounded-bubbly shadow-xl border-4 border-${group.color} text-center h-64`}
                >
                  {/* Photo */}
                  <div className="absolute inset-0">
                    <img
                      src={group.image}
                      alt={t.checkIn.rooms[group.titleKey]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Full card color tint — light at top */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, ${style.topColor} 0%, ${style.bottomColor} 100%)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-end h-full pb-6 px-4">
                    <group.icon
                      className="w-12 h-12 mb-3"
                      style={{
                        color: style.iconColor,
                        filter: 'drop-shadow(0px 1px 4px rgba(255,255,255,0.6))',
                      }}
                    />
                    <h3
                      className="text-xl font-black text-center leading-tight"
                      style={{
                        color: style.textColor,
                        textShadow: '0px 1px 6px rgba(255,255,255,0.5)',
                      }}
                    >
                      {t.checkIn.rooms[group.titleKey]}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-kids-purple to-kids-blue rounded-bubbly p-10 shadow-2xl text-white text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t.home.firstTimeTitle}
          </h2>
          <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto leading-relaxed">
            {t.home.firstTimeDesc}
          </p>
          <div className="bg-white bg-opacity-20 rounded-bubbly p-6 max-w-2xl mx-auto">
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
