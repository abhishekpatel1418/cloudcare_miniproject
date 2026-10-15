import React, { useState, useMemo } from 'react';
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
import { doctorsData } from './data/doctorsData';
import { UserX, RefreshCw } from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);
  const [activeRoleModal, setActiveRoleModal] = useState(null);

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
    const docSection = document.getElementById('doctors');
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* Navigation */}
      <Navbar onSelectRolePortal={(role) => setActiveRoleModal(role)} />

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

      {/* Footer */}
      <Footer />

      {/* Booking and Doctor Profile Modal */}
      {selectedDoctorForModal && (
        <DoctorModal
          doctor={selectedDoctorForModal}
          onClose={() => setSelectedDoctorForModal(null)}
        />
      )}
    </div>
  );
}
