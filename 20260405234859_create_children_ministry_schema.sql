import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Child } from '../lib/supabase';
import { Cake, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Birthdays = () => {
  const { t } = useLanguage();
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
        const birthDate = new Date(child.dob);
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();
        return birthMonth === currentMonth && birthDay === todayDate;
      });

      setTodaysBirthdays(todaysBdayChildren);

      const thisMonth = data.filter((child) => {
        const birthMonth = new Date(child.dob).getMonth() + 1;
        return birthMonth === currentMonth;
      });

      const upcoming = data.filter((child) => {
        const birthDate = new Date(child.dob);
        const thisYear = today.getFullYear();
        const nextBirthday = new Date(
          thisYear,
          birthDate.getMonth(),
          birthDate.getDate()
        );

        if (nextBirthday < today) {
          nextBirthday.setFullYear(thisYear + 1);
        }

        const daysUntil =
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= 30;
      });

      upcoming.sort((a, b) => {
        const dateA = new Date(a.dob);
        const dateB = new Date(b.dob);
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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age + 1;
  };

  const formatDate = (dob: string) => {
    const date = new Date(dob);
    return date.toLocaleDateString(t === undefined ? 'es-ES' : 'es-ES', {
      month: 'long',
      day: 'numeric',
    });
  };

  const BirthdayCard = ({
    child,
    index,
    celebrated,
  }: {
    child: Child;
    index: number;
    celebrated?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      className="bg-white rounded-bubbly p-6 shadow-xl border-4 border-kids-yellow relative overflow-hidden"
    >
      {celebrated && (
        <div className="absolute top-4 right-4 bg-kids-mint text-white px-3 py-1 rounded-full text-sm font-bold">
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
          <Cake className="w-16 h-16 text-kids-coral" />
        </motion.div>
      </div>

      <h3 className="text-2xl font-black text-kids-purple text-center mb-2">
        {child.full_name}
      </h3>

      <div className="text-center">
        <div className="text-lg font-bold text-kids-blue mb-1">
          {t.birthdays.turnsAge.replace('{age}', calculateAge(child.dob).toString())}
        </div>
        <div className="text-md font-semibold text-gray-600">
          {formatDate(child.dob)}
        </div>
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
          <PartyPopper className="w-8 h-8 text-kids-yellow" />
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
              <Cake className="w-24 h-24 text-kids-coral" />
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-kids-purple mb-4">
            {t.birthdays.title}
          </h1>
        </motion.div>

        {todaysBirthdays.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 bg-gradient-to-r from-kids-yellow via-kids-coral to-kids-purple rounded-bubbly p-8 shadow-2xl"
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
          <h2 className="text-3xl font-black text-kids-blue mb-6 flex items-center">
            <PartyPopper className="w-8 h-8 mr-3" />
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
            <div className="bg-white rounded-bubbly p-12 shadow-xl text-center">
              <p className="text-xl font-bold text-gray-500">
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
          <h2 className="text-3xl font-black text-kids-mint mb-6 flex items-center">
            <Cake className="w-8 h-8 mr-3" />
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
                  <BirthdayCard child={child} index={0} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-bubbly p-12 shadow-xl text-center">
              <p className="text-xl font-bold text-gray-500">
                {t.birthdays.noBirthdays}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
