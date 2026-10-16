import React, { useState } from 'react';
import { MotionConfig, AnimatePresence } from 'framer-motion';
import { CustomCursor } from './components/CustomCursor';
import { TarotTable } from './components/TarotTable';
import { LoadingScreen } from './components/LoadingScreen';

export function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      <CustomCursor />
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onLoaded={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      {!isLoading && <TarotTable />}
    </MotionConfig>
  );
}

export default App;
