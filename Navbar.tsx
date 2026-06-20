export const FloatingShapes = () => {
  return (
    <>
      <div className="floating-shape floating-shape-1 w-32 h-32 bg-kids-yellow rounded-full top-[10%] left-[5%]" />
      <div className="floating-shape floating-shape-2 w-24 h-24 bg-kids-blue rounded-full top-[20%] right-[10%]" />
      <div className="floating-shape floating-shape-3 w-40 h-40 bg-kids-coral rounded-full bottom-[15%] left-[15%]" />
      <div className="floating-shape floating-shape-4 w-28 h-28 bg-kids-mint rounded-full top-[50%] right-[20%]" />
      <div className="floating-shape floating-shape-5 w-36 h-36 bg-kids-purple rounded-full bottom-[25%] right-[5%]" />

      <div className="floating-shape floating-shape-1 w-16 h-16 bg-kids-yellow top-[70%] left-[40%]">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      <div className="floating-shape floating-shape-3 w-20 h-20 bg-kids-coral top-[30%] left-[50%]">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    </>
  );
};
