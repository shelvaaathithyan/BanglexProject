import React from 'react';
import { Check, ShieldCheck, Clock, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const InstructionStep = () => {
  return (
    <div className="sf-instruction-v4">
      <div className="sf-instruction-split-v4">
        
        {/* Left Column: Timeline */}
        <div className="sf-instruction-timeline-col-v4">
          <h3 className="sf-heading-acme sf-instruction-heading-v4">Preparation Timeline</h3>
          <div className="sf-prep-timeline-v4">
            <div className="sf-prep-step-v4">
              <div className="sf-prep-dot"><span className="sf-prep-num">1</span></div>
              <div className="sf-prep-content">
                <h4>Ensure Lighting</h4>
                <p>Find a space with even, bright lighting.</p>
              </div>
            </div>
            <div className="sf-prep-step-v4">
              <div className="sf-prep-dot"><span className="sf-prep-num">2</span></div>
              <div className="sf-prep-content">
                <h4>Clear the Wrist</h4>
                <p>Remove watches or existing bangles.</p>
              </div>
            </div>
            <div className="sf-prep-step-v4">
              <div className="sf-prep-dot"><span className="sf-prep-num">3</span></div>
              <div className="sf-prep-content">
                <h4>Fold Thumb</h4>
                <p>Tuck your thumb flat across your palm.</p>
              </div>
            </div>
            <div className="sf-prep-step-v4">
              <div className="sf-prep-dot"><span className="sf-prep-num">4</span></div>
              <div className="sf-prep-content">
                <h4>Hold Steady</h4>
                <p>Keep your hand perfectly still in the frame.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Cards */}
        <div className="sf-instruction-facts-col-v4">
          <div className="sf-fact-card-v4 staggered-1">
            <Clock size={20} className="sf-fact-icon" />
            <div className="sf-fact-text">
              <h4>Scan Time</h4>
              <p>Under 30 seconds</p>
            </div>
          </div>
          
          <div className="sf-fact-card-v4 staggered-2">
            <Smartphone size={20} className="sf-fact-icon" />
            <div className="sf-fact-text">
              <h4>Supported Devices</h4>
              <p>Works on all modern smartphones, tablets, and laptops.</p>
            </div>
          </div>

          <div className="sf-fact-card-v4 staggered-3 privacy">
            <ShieldCheck size={20} className="sf-fact-icon" />
            <div className="sf-fact-text">
              <h4>Privacy Guarantee</h4>
              <p>AI processing occurs securely on your device. No images uploaded.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default InstructionStep;
