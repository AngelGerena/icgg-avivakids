import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Child } from '../lib/supabase';
import { Cake, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Birthdays = () => {
  const { t, language } = useLanguage();
  const [thisMonthBirthdays, setThisMonthBirthdays] = useState<Child[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Child[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Child[]>([]);
  const [currentSpotlight, setCurrentSpotlight] = useState(0);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  useEffect(() => {
    if (todaysBirthdays.length > 0) {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#4FC3F7', '#FF6B6B', '#69F0AE', '#CE93D8'],
      });

      const interval = setInterval(() => {
        setCurrentSpotlight((prev) => (prev + 1) % todaysBirthdays.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [todaysBirthdays]);

  const fetchBirthdays = async () => {
    const { data } = await supabase.from('children').select('*');

    if (data) {
      const currentMonth = new Date().getMonth() + 1;
      const today = new Date();
      const todayDate = today.getDate();

      const todaysBdayChildren = data.filter((child) => {
        const birthDate = new Date(child.dob + 'T12:00:00');
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();
        return birthMonth === currentMonth && birthDay === todayDate;
      });

      setTodaysBirthdays(todaysBdayChildren);

      const thisMonth = data.filter((child) => {
        const birthMonth = new Date(child.dob + 'T12:00:00').getMonth() + 1;
        return birthMonth === currentMonth;
      });

      const upcoming = data.filter((child) => {
        const birthDate = new Date(child.dob + 'T12:00:00');
        const thisYear = today.getFullYear();
        const nextBirthday = new Date(
          thisYear,
          birthDate.getMonth(),
          birthDate.getDate()
        );

        const startOfToday = new Date(thisYear, today.getMonth(), today.getDate());
        if (nextBirthday < startOfToday) {
          nextBirthday.setFullYear(thisYear + 1);
        }

        const daysUntil =
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= 30;
      });

      upcoming.sort((a, b) => {
        const dateA = new Date(a.dob + 'T12:00:00');
        const dateB = new Date(b.dob + 'T12:00:00');
        const thisYear = today.getFullYear();

        const nextA = new Date(thisYear, dateA.getMonth(), dateA.getDate());
        const nextB = new Date(thisYear, dateB.getMonth(), dateB.getDate());

        if (nextA < today) nextA.setFullYear(thisYear + 1);
        if (nextB < today) nextB.setFullYear(thisYear + 1);

        return nextA.getTime() - nextB.getTime();
      });

      setThisMonthBirthdays(thisMonth);
      setUpcomingBirthdays(upcoming);
    }
  };

  // Age the child turns on the birthday being shown: this month's birthday
  // (even if it already happened) or the next one for upcoming lists.
  const calculateAge = (dob: string, upcoming = false) => {
    const birthDate = new Date(dob + 'T12:00:00');
    const today = new Date();
    let year = today.getFullYear();
    if (upcoming) {
      const startOfToday = new Date(year, today.getMonth(), today.getDate());
      const thisYearBirthday = new Date(year, birthDate.getMonth(), birthDate.getDate());
      if (thisYearBirthday < startOfToday) year += 1;
    }
    return year - birthDate.getFullYear();
  };

  const formatDate = (dob: string) => {
    const date = new Date(dob + 'T12:00:00');
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      month: 'long',
      day: 'numeric',
    });
  };

  const BirthdayCard = ({
    child,
    index,
    celebrated,
    upcoming,
  }: {
    child: Child;
    index: number;
    celebrated?: boolean;
    upcoming?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.04, rotate: 1 }}
      style={{ '--c': '#FFD000' } as React.CSSProperties}
      className="avk-panel avk-panel-stripe rounded-bubbly p-6 pt-8"
    >
      {celebrated && (
        <div className="absolute top-4 right-4 bg-kids-mint text-[#1B2452] px-3 py-1 rounded-full text-sm font-black shadow">
          {t.birthdays.celebrated}
        </div>
      )}

      <div className="flex justify-center mb-4">
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-20 h-20 rounded-full bg-kids-coral flex items-center justify-center shadow-[0_0_24px_rgba(255,107,107,0.55)]">
            <Cake className="w-11 h-11 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>
      </div>

      <h3 className="text-2xl font-black text-white text-center mb-3 leading-tight">
        {child.full_name}
      </h3>

      <div className="flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center rounded-full bg-kids-yellow text-[#1B2452] px-4 py-1 font-black">
          {t.birthdays.turnsAge.replace('{age}', calculateAge(child.dob, upcoming).toString())}
        </span>
        <span className="avk-chip">
          {formatDate(child.dob)}
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <PartyPopper className="w-8 h-8 text-kids-yellow drop-shadow" />
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div className="w-24 h-24 rounded-full avk-panel flex items-center justify-center">
                <Cake className="w-14 h-14 text-kids-yellow" strokeWidth={2.5} />
              </div>
            </motion.div>
          </div>
          <h1 className="avk-title text-5xl md:text-6xl mb-2">
            {t.birthdays.title}
            <span className="avk-title-bar" aria-hidden="true" />
          </h1>
        </motion.div>

        {todaysBirthdays.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 bg-gradient-to-r from-[#E0A800] via-[#E0446B] to-[#5B2C8F] rounded-bubbly p-8 shadow-2xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  className="w-24 h-24 text-white"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <ellipse cx="50" cy="80" rx="40" ry="10" fill="white" opacity="0.3" />
                  <ellipse cx="50" cy="40" rx="30" ry="35" fill="currentColor" />
                  <ellipse cx="50" cy="25" rx="25" ry="20" fill="currentColor" />
                  <path d="M 30 35 Q 25 30 28 25" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </motion.div>

              <motion.div
                key={currentSpotlight}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center flex-1"
              >
                <motion.h2
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-5xl md:text-6xl font-black text-white mb-2"
                >
                  {language === 'es' ? '¡Hoy es el cumpleaños de' : "Today is the birthday of"}
                </motion.h2>
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-6xl md:text-7xl font-black text-kids-yellow"
                >
                  {todaysBirthdays[currentSpotlight]?.full_name}!
                </motion.div>
                <div className="text-3xl font-bold text-white mt-4">
                  {calculateAge(todaysBirthdays[currentSpotlight]?.dob)}{' '}
                  {language === 'es' ? 'años' : 'years old'}
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  className="w-24 h-24 text-white"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <ellipse cx="50" cy="80" rx="40" ry="10" fill="white" opacity="0.3" />
                  <ellipse cx="50" cy="40" rx="30" ry="35" fill="currentColor" />
                  <ellipse cx="50" cy="25" rx="25" ry="20" fill="currentColor" />
                  <path d="M 30 35 Q 25 30 28 25" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </motion.div>
            </div>

            {todaysBirthdays.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {todaysBirthdays.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSpotlight ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#2A1E57] mb-6 flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-kids-blue flex items-center justify-center shadow-lg">
              <PartyPopper className="w-7 h-7 text-white" strokeWidth={2.5} />
            </span>
            {t.birthdays.thisMonth}
          </h2>

          {thisMonthBirthdays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thisMonthBirthdays.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <BirthdayCard
                    child={child}
                    index={0}
                    celebrated={child.birthday_celebrated}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="avk-panel rounded-bubbly p-12 text-center">
              <p className="text-xl font-bold text-white/85">
                {t.birthdays.noBirthdays}
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#2A1E57] mb-6 flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-kids-mint flex items-center justify-center shadow-lg">
              <Cake className="w-7 h-7 text-white" strokeWidth={2.5} />
            </span>
            {t.birthdays.upcoming}
          </h2>

          {upcomingBirthdays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBirthdays.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <BirthdayCard child={child} index={0} upcoming />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="avk-panel rounded-bubbly p-12 text-center">
              <p className="text-xl font-bold text-white/85">
                {t.birthdays.noBirthdays}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
