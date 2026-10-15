import React from 'react';
import { 
  HeartPulse, 
  Brain, 
  Bone, 
  Baby, 
  Sparkles, 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { departmentsData } from '../data/departmentsData';

const iconMap = {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Sparkles,
  Stethoscope,
  Activity,
  ShieldAlert
};

export default function Departments({ onSelectDepartment }) {
  const handleDepartmentClick = (deptName) => {
    onSelectDepartment(deptName);
    const docSection = document.getElementById('doctors');
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="specialties" className="section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Clinical Excellence</span>
          <h2 className="section-title">Specialized Hospital Departments</h2>
          <p className="section-desc">
            Explore dedicated clinical wings led by certified physicians, surgeons, and specialists. 
            Click any department to view available doctors and schedule an appointment.
          </p>
        </div>

        <div className="departments-grid">
          {departmentsData.map((dept) => {
            const IconComponent = iconMap[dept.iconName] || Stethoscope;
            return (
              <div 
                key={dept.id} 
                className="dept-card"
                onClick={() => handleDepartmentClick(dept.name)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="dept-icon-wrapper">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="dept-name">{dept.name}</h3>
                  <p className="dept-desc">{dept.shortDesc}</p>
                </div>

                <div>
                  <div className="dept-meta">
                    <span>{dept.activeRooms}</span>
                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {dept.doctorCount} Doctors
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
