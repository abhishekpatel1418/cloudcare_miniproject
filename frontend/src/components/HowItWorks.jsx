import React from 'react';
import { Search, CalendarCheck, BellRing, UserCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Find Your Specialist",
      desc: "Search by specialty, doctor name, or medical condition. Filter by same-day availability.",
      icon: Search
    },
    {
      number: "02",
      title: "Choose Date & Time Slot",
      desc: "Select an open consultation slot that matches your convenience without queuing at reception.",
      icon: CalendarCheck
    },
    {
      number: "03",
      title: "Instant Cloud Notification",
      desc: "Appointment details are written to Amazon DynamoDB and sent via email (Amazon SES) with an appointment token.",
      icon: BellRing
    },
    {
      number: "04",
      title: "Seamless Hospital Visit",
      desc: "Arrive at CloudCare hospital wing, present your booking token, and proceed directly to consultation.",
      icon: UserCheck
    }
  ];

  return (
    <section id="how-it-works" className="section-padding" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Smooth Patient Journey</span>
          <h2 className="section-title">How CloudCare Works</h2>
          <p className="section-desc">
            A frictionless, transparent appointment booking workflow designed for patients, doctors, and hospital administrators.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="step-card">
                <div className="step-badge">{step.number}</div>
                <div style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                  <Icon size={28} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
