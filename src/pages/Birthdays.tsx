import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Child } from '../lib/supabase';
import { Cake, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

// Privacy-safe: only show first name on public birthday page
const firstName = (fullName: string) => fullName.trim().split(' ')[0];

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
    // Only fetch fields needed — no last names, no parent info, no contact data
    const { data } = await supabase.from('children').select('id, full_name, dob, birthday_celebrated');

    if (data) {
      const currentMonth = new Date().getMonth() + 1;
      const today = new Date();
      const todayDate = today.getDate();

      const todaysBday = data.filter((child) => {
        const d = new Date(child.dob + 'T12:00:00');
        return d.getMonth() + 1 === currentMonth && d.getDate() === todayDate;
      });
      setTodaysBirthdays(todaysBday);

      const thisMonth = data.filter((child) => {
        return new Date(child.dob + 'T12:00:00').getMonth() + 1 === currentMonth;
      });
      setThisMonthBirthdays(thisMonth);

      const upcoming = data.filter((child) => {
        const birthDate = new Date(child.dob + 'T12:00:00');
        const thisYear = today.getFullYear();
        const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) nextBirthday.setFullYear(thisYear + 1);
        const daysUntil = (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= 30;
      });

      upcoming.sort((a, b) => {
        const thisYear = today.getFullYear();
        const dA = new Date(a.dob + 'T12:00:00');
        const dB = new Date(b.dob + 'T12:00:00');
        const nA = new Date(thisYear, dA.getMonth(), dA.getDate());
        const nB = new Date(thisYear, dB.getMonth(), dB.getDate());
        if (nA < today) nA.setFullYear(thisYear + 1);
        if (nB < today) nB.setFullYear(thisYear + 1);
        return nA.getTime() - nB.getTime();
      });

      setUpcomingBirthdays(upcoming);
    }
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob + 'T12:00:00');
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age + 1;
  };

  const formatDate = (dob: string) => {
    return new Date(dob + 'T12:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric' });
  };

  const BirthdayCard = ({ child, celebrated }: { child: Child; celebrated?: boolean }) => (
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
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Cake className="w-16 h-16 text-kids-coral" />
        </motion.div>
      </div>
      <h3 className="text-2xl font-black text-kids-purple text-center mb-2">
        {firstName(child.full_name)}
      </h3>
      <div className="text-center">
        <div className="text-lg font-bold text-kids-blue mb-1">
          {t.birthdays.turnsAge.replace('{age}', calculateAge(child.dob).toString())}
        </div>
        <div className="text-md font-semibold text-gray-600">{formatDate(child.dob)}</div>
      </div>
      <div className="mt-4 flex justify-center">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
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
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
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
              <PartyPopper className="w-16 h-16 text-white hidden md:block" />
              <motion.div
                key={currentSpotlight}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center flex-1"
              >
                <motion.h2
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl md:text-5xl font-black text-white mb-2"
                >
                  {language === 'es' ? '¡Hoy es el cumpleaños de' : "Today is the birthday of"}
                </motion.h2>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-5xl md:text-6xl font-black text-kids-yellow"
                >
                  {firstName(todaysBirthdays[currentSpotlight]?.full_name)}!
                </motion.div>
                <div className="text-2xl font-bold text-white mt-4">
                  {calculateAge(todaysBirthdays[currentSpotlight]?.dob)}{' '}
                  {language === 'es' ? 'años' : 'years old'}
                </div>
              </motion.div>
              <Cake className="w-16 h-16 text-white hidden md:block" />
            </div>
            {todaysBirthdays.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {todaysBirthdays.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === currentSpotlight ? 'bg-white' : 'bg-white/40'}`}
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
                  <BirthdayCard child={child} celebrated={child.birthday_celebrated} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-bubbly p-12 shadow-xl text-center">
              <p className="text-xl font-bold text-gray-500">{t.birthdays.noBirthdays}</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
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
                  <BirthdayCard child={child} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-bubbly p-12 shadow-xl text-center">
              <p className="text-xl font-bold text-gray-500">{t.birthdays.noBirthdays}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
