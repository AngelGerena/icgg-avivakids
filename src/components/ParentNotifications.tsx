import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  child_id: string;
  alert_type: 'pickup_request' | 'emergency' | 'general';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Child {
  id: string;
  full_name: string;
  unique_number: string;
}

export const ParentNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [childNumber, setChildNumber] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('parentAuth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        const hoursSinceAuth = (new Date().getTime() - authData.timestamp) / (1000 * 60 * 60);

        if (hoursSinceAuth < 24) {
          setIsAuthenticated(true);
          loadChildrenAndNotifications(authData.childIds);
        } else {
          localStorage.removeItem('parentAuth');
        }
      } catch (e) {
        localStorage.removeItem('parentAuth');
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || children.length === 0) return;

    const childIds = children.map((c) => c.id);

    const channel = supabase
      .channel('parent-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'parent_notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (childIds.includes(newNotification.child_id)) {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
            showBrowserNotification(newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, children]);

  const authenticateParent = async () => {
    if (!childNumber.trim() || !parentEmail.trim()) {
      alert('Please enter both your child\'s unique number and your email address');
      return;
    }

    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, full_name, unique_number')
      .eq('unique_number', childNumber.trim())
      .maybeSingle();

    if (childError || !child) {
      alert('Child not found. Please check the number and try again.');
      return;
    }

    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id, primary_email, child_id')
      .eq('child_id', child.id)
      .maybeSingle();

    if (parentError || !parent) {
      alert('Parent information not found for this child.');
      return;
    }

    if (parent.primary_email.toLowerCase() !== parentEmail.trim().toLowerCase()) {
      alert('Email does not match our records. Please use the email address you provided during registration.');
      return;
    }

    const childIds = [child.id];
    const authData = {
      childIds,
      email: parent.primary_email,
      timestamp: new Date().getTime(),
    };

    localStorage.setItem('parentAuth', JSON.stringify(authData));
    setIsAuthenticated(true);
    setShowLogin(false);
    setChildNumber('');
    setParentEmail('');
    loadChildrenAndNotifications(childIds);
  };

  const loadChildrenAndNotifications = async (childIds: string[]) => {
    const { data: childrenData } = await supabase
      .from('children')
      .select('id, full_name, unique_number')
      .in('id', childIds);

    if (childrenData) {
      setChildren(childrenData);

      const { data: notificationsData } = await supabase
        .from('parent_notifications')
        .select('*')
        .in('child_id', childIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsData) {
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter((n) => !n.is_read).length);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('parentAuth');
    setIsAuthenticated(false);
    setChildren([]);
    setNotifications([]);
    setUnreadCount(0);
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwNU6rm8LRiFwU7k9nywHkpBSd+zPLaizsKGGS57OihUBELTKXh8bllHAU2jdXuxHYnBSl+zPLajDkJF2u98OScUQwPVKzm8LNhHAU8lNryvnkoBSh9zPLajDkJGGS57OifUhELTKXh8bllHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBSZ8y/LajDkJGGS57OifTxELTKXh8bdmHAU1jdXuxHYnBSh+zPLajDkJF2q98OScTwwOVKzm8LNhHAU8lNryvnkoBQ==');
    audio.play().catch(() => {});
  };

  const showBrowserNotification = async (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const child = children.find((c) => c.id === notification.child_id);
      new Notification('Children\'s Ministry Alert', {
        body: `${child?.full_name || 'Your child'}: ${notification.message}`,
        icon: '/icon.png',
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('parent_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('parent_notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getChildName = (childId: string) => {
    return children.find((c) => c.id === childId)?.full_name || 'Child';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pickup_request':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'border-red-500 bg-red-50';
      case 'pickup_request':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (isAuthenticated) {
            setShowNotifications(!showNotifications);
          } else {
            setShowLogin(true);
          }
        }}
        className="relative p-3 bg-white rounded-full shadow-lg"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {showLogin && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-0 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Parent Login</h3>
              <button
                onClick={() => setShowLogin(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                Enter your child's unique number and your registered email to view notifications
              </p>
              <input
                type="text"
                value={childNumber}
                onChange={(e) => setChildNumber(e.target.value)}
                placeholder="Child's unique number"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-3"
              />
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && authenticateParent()}
                placeholder="Your email address"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
              />
              <button
                onClick={authenticateParent}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow"
              >
                Access Notifications
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Use the email address you provided during registration
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-0 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-white text-sm hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {children.length > 0 && (
                <div className="flex items-center justify-between text-white text-xs">
                  <span>Viewing: {children[0].full_name}</span>
                  <button
                    onClick={logout}
                    className="hover:underline"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-y-auto max-h-[520px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getAlertIcon(notification.alert_type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900">
                              {getChildName(notification.child_id)}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm mb-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
