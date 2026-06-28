import React, { useState, useEffect } from 'react';
import Hero from '../components/sizeFinder/Hero';
import InfoCards from '../components/sizeFinder/InfoCards';
import PermissionScreen from '../components/sizeFinder/PermissionScreen';
import CameraScanner from '../components/sizeFinder/CameraScanner';
import ResultCard from '../components/sizeFinder/ResultCard';
import { useHandScanner, SCAN_PHASES } from '../hooks/useHandScanner';
import '../styles/sizeFinder.css';
import { Camera } from 'lucide-react';

const SizeFinder = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const scannerHook = useHandScanner();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    // Cleanup on unmount handled strictly by hook
  }, []);

  const handleStartScan = () => {
    setHasPermission(true);
  };

  const handleRetry = () => {
    setHasPermission(false);
    scannerHook.destroyResources();
    scannerHook.reset();
  };

  return (
    <div className="sf-section">
      <div className="sf-container">
        
        {!hasPermission && scannerHook.phase !== SCAN_PHASES.COMPLETE && (
          <>
            <Hero />
            
            <div className="sf-start-section">
              <button className="sf-btn-primary sf-start-btn" onClick={() => setHasPermission('prompt')}>
                Start Size Scan
              </button>
            </div>

            <InfoCards />
          </>
        )}

        {hasPermission === 'prompt' && (
          <PermissionScreen onContinue={handleStartScan} />
        )}

        {hasPermission === true && scannerHook.phase !== SCAN_PHASES.COMPLETE && (
          <div className="sf-scanner-section">
            <h2 className="sf-section-title">Live Hand Scan</h2>
            <CameraScanner scannerHook={scannerHook} />
            <button className="sf-btn-secondary sf-cancel-btn" onClick={handleRetry}>
              Cancel Scan
            </button>
          </div>
        )}

        {scannerHook.phase === SCAN_PHASES.COMPLETE && scannerHook.result && (
          <div className="sf-result-section">
            <ResultCard result={scannerHook.result} onRetry={handleRetry} />
          </div>
        )}

      </div>
    </div>
  );
};

export default SizeFinder;
