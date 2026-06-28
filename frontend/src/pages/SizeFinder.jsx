import React, { useState, useEffect } from 'react';
import Hero from '../components/sizeFinder/Hero';
import InfoCards from '../components/sizeFinder/InfoCards';
import PermissionScreen from '../components/sizeFinder/PermissionScreen';
import CameraScanner from '../components/sizeFinder/CameraScanner';
import ResultCard from '../components/sizeFinder/ResultCard';
import { useHandScanner, SCAN_PHASES } from '../hooks/useHandScanner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/sizeFinder.css';
import { Camera } from 'lucide-react';

const SizeFinder = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const scannerHook = useHandScanner();

  useEffect(() => {
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
    <div className="category-page">
      <Navbar />
      <div className="sf-section" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="sf-container">
        
        {!hasPermission && scannerHook.phase !== SCAN_PHASES.COMPLETE && (
          <div className="sf-landing-wrapper">
            <Hero setHasPermission={setHasPermission} />
            <div className="sf-info-overlap">
              <InfoCards />
            </div>
          </div>
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
      <Footer />
    </div>
  );
};

export default SizeFinder;
