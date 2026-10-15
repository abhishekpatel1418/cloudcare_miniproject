import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EmergencyBanner from './components/EmergencyBanner';
import Departments from './components/Departments';
import SearchFilter from './components/SearchFilter';
import DoctorCard from './components/DoctorCard';
import DoctorModal from './components/DoctorModal';
import HowItWorks from './components/HowItWorks';
import RolePortalsPreview from './components/RolePortalsPreview';
import AwsTechStack from './components/AwsTechStack';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PatientDashboard from './components/dashboards/PatientDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import { doctorsData } from './data/doctorsData';
import { getStoredSession, logoutUser } from './services/cognitoAuth';
import { UserX, RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => getStoredSession());
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'dashboard'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);
  const [activeRoleModal, setActiveRoleModal] = useState(null);

  useEffect(() => {
    // Check session on mount
    const session = getStoredSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('home');
  };

  const handleAuthSuccess = (newSession) => {
    setUser(newSession);
    setAuthModalOpen(false);
  };

  const openAuthWithTab = (tabName = 'login') => {
    setAuthModalTab(tabName);
    setAuthModalOpen(true);
  };

  // Filtered doctors list based on search, department, and availability
  const filteredDoctors = useMemo(() => {
    return doctorsData.filter((doctor) => {
      // 1. Department Filter
      if (selectedDepartment !== 'All' && doctor.specialty !== selectedDepartment) {
        return false;
      }

      // 2. Availability Filter
      if (onlyAvailableToday && !doctor.availableToday) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = doctor.name.toLowerCase().includes(query);
        const matchesSpecialty = doctor.specialty.toLowerCase().includes(query);
        const matchesQual = doctor.qualification.toLowerCase().includes(query);
        const matchesBio = doctor.bio.toLowerCase().includes(query);
        const matchesLocation = doctor.hospitalLocation.toLowerCase().includes(query);

        return matchesName || matchesSpecialty || matchesQual || matchesBio || matchesLocation;
      }

      return true;
    });
  }, [searchQuery, selectedDepartment, onlyAvailableToday]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setOnlyAvailableToday(false);
  };

  const handleHeroSearch = () => {
    setCurrentView('home');
    setTimeout(() => {
      const docSection = document.getElementById('doctors');
      if (docSection) {
        docSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="app-wrapper">
      {/* Navigation */}
      <Navbar 
        user={user}
        onOpenAuth={() => openAuthWithTab('login')}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* DASHBOARD VIEW (Protected) */}
      {currentView === 'dashboard' ? (
        !user ? (
          <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
              Sign In to Access Your Dashboard
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>
              Please authenticate using your Amazon Cognito credentials to access patient bookings, doctor schedules, or hospital admin controls.
            </p>
            <button onClick={() => openAuthWithTab('login')} className="btn btn-primary">
              Sign In / Register
            </button>
          </div>
        ) : user.role === 'Admin' ? (
          <AdminDashboard user={user} />
        ) : user.role === 'Doctor' ? (
          <DoctorDashboard user={user} />
        ) : (
          <PatientDashboard 
            user={user} 
            onBookNewClick={() => {
              setCurrentView('home');
              setTimeout(() => {
                const docSection = document.getElementById('doctors');
                if (docSection) docSection.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onLogout={handleLogout}
          />
        )
      ) : (
        /* HOME PAGE VIEW (Full Catalog & Healthcare Experience) */
        <>
          {/* Hero Section */}
          <Hero
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            onPerformSearch={handleHeroSearch}
          />

          {/* 24/7 Emergency Triage Banner */}
          <EmergencyBanner />

          {/* Specialties / Departments */}
          <Departments onSelectDepartment={(deptName) => setSelectedDepartment(deptName)} />

          {/* Doctors Directory Section */}
          <section id="doctors" className="section-padding" style={{ backgroundColor: 'var(--gray-50)' }}>
            <div className="container">
              <div className="section-header">
                <span className="section-tag">Qualified Medical Staff</span>
                <h2 className="section-title">Find & Consult Top Specialists</h2>
                <p className="section-desc">
                  Browse our accredited medical faculty, view clinical experience, and book direct OPD consultation slots.
                </p>
              </div>

              {/* Search and Filter Control Bar */}
              <SearchFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                onlyAvailableToday={onlyAvailableToday}
                setOnlyAvailableToday={setOnlyAvailableToday}
                totalResults={filteredDoctors.length}
              />

              {/* Doctor Cards Listing or Empty State */}
              {filteredDoctors.length > 0 ? (
                <div className="doctors-grid">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onBookClick={(doc) => setSelectedDoctorForModal(doc)}
                      onViewProfile={(doc) => setSelectedDoctorForModal(doc)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div 
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'var(--gray-100)',
                      color: 'var(--gray-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto'
                    }}
                  >
                    <UserX size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '8px' }}>
                    No doctors match your criteria
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                    Try adjusting your search terms, changing the specialty filter, or removing the "Available Today" constraint.
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-outline">
                    <RefreshCw size={15} />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* How It Works */}
          <HowItWorks />

          {/* User Roles & Portals Preview (Patient, Doctor, Admin) */}
          <RolePortalsPreview
            activeRoleModal={activeRoleModal}
            setActiveRoleModal={setActiveRoleModal}
          />

          {/* AWS Cloud Architecture & Services */}
          <AwsTechStack />
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Booking and Doctor Profile Modal */}
      {selectedDoctorForModal && (
        <DoctorModal
          doctor={selectedDoctorForModal}
          onClose={() => setSelectedDoctorForModal(null)}
          user={user}
          onRequireAuth={() => openAuthWithTab('login')}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalTab}
      />
    </div>
  );
}
