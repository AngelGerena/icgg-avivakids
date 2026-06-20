@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    overflow-x: hidden;
  }

  body {
    font-family: 'Baloo 2', cursive;
    @apply bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen;
    overflow-x: hidden;
    position: relative;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(5deg);
  }
  50% {
    transform: translateY(-10px) translateX(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-30px) translateX(5px) rotate(3deg);
  }
}

@keyframes floatSlow {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-40px) translateX(20px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
  }
}

.floating-shape {
  position: fixed;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.floating-shape-1 {
  animation: float 15s ease-in-out infinite;
  animation-delay: 0s;
}

.floating-shape-2 {
  animation: float 18s ease-in-out infinite;
  animation-delay: 2s;
}

.floating-shape-3 {
  animation: float 20s ease-in-out infinite;
  animation-delay: 4s;
}

.floating-shape-4 {
  animation: floatSlow 25s ease-in-out infinite;
  animation-delay: 1s;
}

.floating-shape-5 {
  animation: floatSlow 22s ease-in-out infinite;
  animation-delay: 3s;
}
