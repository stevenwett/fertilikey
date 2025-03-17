import React, { useState, useRef } from 'react';

const InstitutionResults = ({ selectedInstitution }) => {
  const [expandedBenefits, setExpandedBenefits] = useState(false);
  const [expandedOtherInfo, setExpandedOtherInfo] = useState(false);
  const benefitsRef = useRef(null);
  const otherInfoRef = useRef(null);
  
  if (!selectedInstitution) {
    return (
      <div className="alert alert-info mt-4">
        <p className="mb-0">We currently only have data for Ob/Gyn and Plastic Surgery programs</p>
      </div>
    );
  }

  // Helper to determine if a value exists (including zero)
  const hasValue = (value) => value !== null && value !== undefined;

  // Determine display values for different leave types
  const maternalLeave = hasValue(selectedInstitution.maternal_leave_weeks) 
    ? `${selectedInstitution.maternal_leave_weeks} Weeks` 
    : "Unknown leave";
  
  const paternalLeave = hasValue(selectedInstitution.paternal_leave_weeks) 
    ? `${selectedInstitution.paternal_leave_weeks} Weeks` 
    : "Unknown leave";

  // Determine fertility benefits display
  const hasFertilityBenefits = selectedInstitution.has_fertility_benefits;
  const fertilityBenefitsMessage = hasFertilityBenefits 
    ? "Benefits offered" 
    : hasFertilityBenefits === false 
      ? "No benefits offered" 
      : "Unknown benefits";
  
  // Toggle functions for both collapsible sections
  const toggleBenefits = () => {
    setExpandedBenefits(!expandedBenefits);
  };

  const toggleOtherInfo = () => {
    setExpandedOtherInfo(!expandedOtherInfo);
  };

  // Helper to get preview text (first 100 characters)
  const getPreviewText = (text) => {
    if (!text) return "";
    
    if (text.length <= 100) return text;
    
    return `${text.substring(0, 100)}...`;
  };

  return (
    <article className="card mt-4 mb-4">
      <div className="card-body">
        <section>
          <h3>PAID LEAVE</h3>
          <div className="row">
            <div className="col-md-6">
              {hasValue(selectedInstitution.maternal_leave_weeks) ? (
                <div className="leave-info">
                  <p className="leave-weeks mb-0">{maternalLeave}</p>
                  <div className="leave-type">Maternal Leave</div>
                </div>
              ) : (
                <div className="unknown-info">
                  <i className="bi bi-circle"></i> {maternalLeave}
                </div>
              )}
            </div>
            
            {hasValue(selectedInstitution.paternal_leave_weeks) && (
              <div className="col-md-6">
                <div className="leave-info">
                  <p className="leave-weeks mb-0">{paternalLeave}</p>
                  <div className="leave-type">Paternal Leave</div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        <section className="mt-3">
          <h3>FERTILITY BENEFITS</h3>
          <div>
            {hasFertilityBenefits ? (
              <>
                <div className="benefit-status mb-2">
                  <i className="bi bi-check-circle text-success"></i> {fertilityBenefitsMessage}
                </div>
                <ul className="benefit-details">
                  {selectedInstitution.benefit_amount && (
                    <li>Lifetime benefit of ${selectedInstitution.benefit_amount.toLocaleString()}</li>
                  )}
                  {selectedInstitution.limits_for_coverage === "No" && (
                    <li>No limits for coverage</li>
                  )}
                  {selectedInstitution.elective_treatment_covered && (
                    <li>{selectedInstitution.elective_treatment_covered}</li>
                  )}
                </ul>
              </>
            ) : (
              <div className="benefit-status mb-2">
                {hasFertilityBenefits === false ? (
                  <i className="bi bi-x-circle text-danger"></i>
                ) : (
                  <i className="bi bi-circle text-secondary"></i>
                )} {fertilityBenefitsMessage}
              </div>
            )}
            
            {selectedInstitution.benefits_offered && (
              <div className="collapsible-section mt-3">
                <div 
                  className={`collapsible-content ${expandedBenefits ? 'expanded' : ''}`}
                  ref={benefitsRef}
                  style={{ 
                    maxHeight: expandedBenefits 
                      ? `${benefitsRef.current?.scrollHeight || 1000}px` 
                      : '3em',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease'
                  }}
                >
                  <p>{selectedInstitution.benefits_offered}</p>
                </div>
                <button 
                  className="btn btn-sm btn-link p-0 mt-1" 
                  onClick={toggleBenefits}
                >
                  {expandedBenefits ? 'Show Less' : 'Read More'} 
                  <i className={`bi bi-chevron-${expandedBenefits ? 'up' : 'down'} ms-1`}></i>
                </button>
              </div>
            )}
            
            {selectedInstitution.other_details && (
              <div className="collapsible-section mt-3">
                <div 
                  className={`collapsible-content ${expandedOtherInfo ? 'expanded' : ''}`}
                  ref={otherInfoRef}
                  style={{ 
                    maxHeight: expandedOtherInfo 
                      ? `${otherInfoRef.current?.scrollHeight || 1000}px` 
                      : '3em',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease'
                  }}
                >
                  <p>{selectedInstitution.other_details}</p>
                </div>
                <button 
                  className="btn btn-sm btn-link p-0 mt-1" 
                  onClick={toggleOtherInfo}
                >
                  {expandedOtherInfo ? 'Show Less' : 'Read More'} 
                  <i className={`bi bi-chevron-${expandedOtherInfo ? 'up' : 'down'} ms-1`}></i>
                </button>
              </div>
            )}
          </div>
        </section>
        
        <hr className="my-4" />
        
        <footer>
          <p className="institution-name mb-0"><strong>{selectedInstitution.name}</strong></p>
          <p className="institution-location mb-0">{selectedInstitution.city}, {selectedInstitution.state_name} {selectedInstitution.postal_code}</p>
          
          {selectedInstitution.url && (
            <div className="institution-url">
              <a href={selectedInstitution.url} target="_blank" rel="noopener noreferrer">
                {selectedInstitution.url.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            </div>
          )}
          
          {selectedInstitution.data_source && (
            <div className="data-source mt-2">
              <p className="mb-0"><strong>DATA SOURCE:</strong></p>
              <p>{selectedInstitution.data_source}</p>
            </div>
          )}
        </footer>
      </div>
    </article>
  );
};

export default InstitutionResults;