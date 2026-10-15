import React from 'react';
import { PhoneCall, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <div className="emergency-strip">
      <div className="container">
        <div className="emergency-content">
          <div className="emergency-left">
            <ShieldAlert size={20} color="#be123c" />
            <span>24/7 Trauma, ICU & Emergency Medical Services Available</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: 500 }}>
              Immediate Emergency Triage:
            </span>
            <a href="tel:108" className="emergency-phone">
              <PhoneCall size={14} />
              <span>+91 1800-CLOUDCAR (Toll Free)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
