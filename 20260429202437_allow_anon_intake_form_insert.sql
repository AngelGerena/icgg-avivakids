import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { FloatingShapes } from './components/FloatingShapes';
import { AlertBanner } from './components/AlertBanner';
import { MouseTrail } from './components/MouseTrail';
import { Home } from './pages/Home';
import { IntakeForm } from './pages/IntakeForm';
import { Calendar } from './pages/Calendar';
import { Birthdays } from './pages/Birthdays';
import { TeacherPortal } from './pages/TeacherPortal';
import { ParentWatch } from './pages/ParentWatch';

function AppContent() {
  const location = useLocation();
  const hideFloatingShapes = location.pathname === '/intake-form';

  return (
    <>
      {!hideFloatingShapes && <FloatingShapes />}
      <MouseTrail />
      <AlertBanner />
      <Navbar />
      <div className="pb-24 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/intake-form" element={<IntakeForm />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/birthdays" element={<Birthdays />} />
              <Route path="/admin" element={<TeacherPortal />} />
              <Route path="/notifications" element={<ParentWatch />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
