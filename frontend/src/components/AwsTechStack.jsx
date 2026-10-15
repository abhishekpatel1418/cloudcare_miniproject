import React from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  Lock, 
  Globe, 
  Mail, 
  Activity, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';

export default function AwsTechStack() {
  const stack = [
    {
      category: "Frontend UI",
      service: "React + Vite & AWS Amplify",
      desc: "Fast single-page application with responsive CSS, continuous delivery & SSL via Amplify Hosting.",
      icon: Globe,
      status: "Active (Local Dev)"
    },
    {
      category: "Compute & Backend",
      service: "Node.js on AWS Lambda",
      desc: "Event-driven, serverless compute executing microservices for appointments, doctors & cancelation workflows.",
      icon: Cpu,
      status: "Planned (Phase 2)"
    },
    {
      category: "API Layer",
      service: "Amazon API Gateway",
      desc: "RESTful endpoints with CORS, rate-limiting, and Cognito Authorizers protecting backend functions.",
      icon: Server,
      status: "Planned (Phase 2)"
    },
    {
      category: "NoSQL Database",
      service: "Amazon DynamoDB",
      desc: "Single-digit millisecond latency table with partition keys (`PK`) and sort keys (`SK`) for appointments and doctor schedules.",
      icon: Database,
      status: "Planned (Phase 2)"
    },
    {
      category: "Identity & RBAC",
      service: "Amazon Cognito",
      desc: "User pools & identity pools providing JWT token authentication with separate Patient, Doctor, and Admin groups.",
      icon: Lock,
      status: "Planned (Phase 2)"
    },
    {
      category: "Email Notifications",
      service: "Amazon SES",
      desc: "Transactional email service dispatching appointment booking confirmations and reminders in the AWS free tier.",
      icon: Mail,
      status: "Planned (Phase 3)"
    },
    {
      category: "Observability",
      service: "Amazon CloudWatch",
      desc: "Centralized logging for Lambda execution logs, API Gateway request metrics, and alarm triggers.",
      icon: Activity,
      status: "Planned (Phase 4)"
    },
    {
      category: "Security & Access",
      service: "AWS IAM",
      desc: "Least-privilege roles ensuring Lambda execution roles only access designated DynamoDB tables and SES resources.",
      icon: ShieldCheck,
      status: "Planned (Phase 2)"
    }
  ];

  return (
    <section id="aws-architecture" className="aws-section">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            System Architecture
          </span>
          <h2 className="section-title">AWS Serverless Architecture Mapping</h2>
          <p className="section-desc">
            Designed for high availability, zero cold-start waste, and scalable patient traffic with zero upfront server management.
          </p>
        </div>

        <div className="aws-grid">
          {stack.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="aws-service-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'rgba(56, 189, 248, 0.12)', 
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-full)',
                    background: item.status.includes('Active') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: item.status.includes('Active') ? '#34d399' : '#94a3b8'
                  }}>
                    {item.status}
                  </span>
                </div>

                <div className="aws-badge">{item.category}</div>
                <h4 className="aws-service-name">{item.service}</h4>
                <p className="aws-service-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
