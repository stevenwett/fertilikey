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
    <div>
      <section>
        <h3>
          PAID LEAVE
          {(hasValue(selectedInstitution.maternal_leave_weeks) && selectedInstitution.maternal_leave_weeks > 0) || 
           (hasValue(selectedInstitution.paternal_leave_weeks) && selectedInstitution.paternal_leave_weeks > 0) ? (
            <i className="bi bi-check-circle text-success ms-2"></i>
          ) : (hasValue(selectedInstitution.maternal_leave_weeks) && selectedInstitution.maternal_leave_weeks === 0) || 
             (hasValue(selectedInstitution.paternal_leave_weeks) && selectedInstitution.paternal_leave_weeks === 0) ? (
            <i className="bi bi-x-circle text-danger ms-2"></i>
          ) : (
            <i className="bi bi-question-circle text-secondary ms-2"></i>
          )}
        </h3>
        <div className="row">
          <div className="col-md-6">
            {hasValue(selectedInstitution.maternal_leave_weeks) && selectedInstitution.maternal_leave_weeks > 0 ? (
              <div className="leave-info">
                <p className="leave-weeks mb-0">{maternalLeave}</p>
                <div className="leave-type">Maternal Leave</div>
              </div>
            ) : hasValue(selectedInstitution.maternal_leave_weeks) && selectedInstitution.maternal_leave_weeks === 0 ? (
              <div className="leave-info zero-leave">
                <p className="leave-weeks mb-0">No Leave</p>
                <div className="leave-type">Maternal Leave</div>
              </div>
            ) : null}
          </div>
          <div className="col-md-6">
            {hasValue(selectedInstitution.paternal_leave_weeks) && selectedInstitution.paternal_leave_weeks > 0 ? (
              <div className="leave-info">
                <p className="leave-weeks mb-0">{paternalLeave}</p>
                <div className="leave-type">Non-birthing Parental Leave</div>
              </div>
            ) : hasValue(selectedInstitution.paternal_leave_weeks) && selectedInstitution.paternal_leave_weeks === 0 ? (
              <div className="leave-info zero-leave">
                <p className="leave-weeks mb-0">No Leave</p>
                <div className="leave-type">Non-birthing Parental Leave</div>
              </div>
            ) : null}
          </div>
        </div>
        {!hasValue(selectedInstitution.maternal_leave_weeks) && !hasValue(selectedInstitution.paternal_leave_weeks) && (
          <p>No paid leave information available</p>
        )}
      </section>
        <section className="mt-3">
          <h3>
            FERTILITY BENEFITS
            {hasFertilityBenefits ? (
              <i className="bi bi-check-circle text-success ms-2"></i>
            ) : hasFertilityBenefits === false ? (
              <i className="bi bi-x-circle text-danger ms-2"></i>
            ) : (
              <i className="bi bi-question-circle text-secondary ms-2"></i>
            )}
          </h3>
          <div>
            {hasFertilityBenefits ? (
              <>
                <ul className="benefit-details">
                  <li>{fertilityBenefitsMessage}</li>
                  {selectedInstitution.benefit_amount && (
                    <li>Lifetime benefit of ${selectedInstitution.benefit_amount.toLocaleString()}</li>
                  )}
                  {selectedInstitution.limits_for_coverage === "No" && (
                    <li>No limits for coverage</li>
                  )}
                  {/* {selectedInstitution.elective_treatment_covered && 
                   selectedInstitution.elective_treatment_covered !== "undefined" && 
                   selectedInstitution.elective_treatment_covered.toString().trim() !== "" && (
                    <li>{selectedInstitution.elective_treatment_covered}</li>
                  )} */}
                </ul>
              </>
            ) : hasFertilityBenefits === false ? (
              <p>{fertilityBenefitsMessage}</p>
            ) : (
              <p>No fertility benefits information available</p>
            )}
            
            {selectedInstitution.benefits_offered && (
              <>
                <h3>Benefits Offered</h3>
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
              </>
            )}
          
          </div>
        </section>
        <hr />
        <footer>
          <h4 className="mb-0">SOURCE(S):</h4>
          {selectedInstitution.url && (
              <p className="mb-1"><a href={selectedInstitution.url} target="_blank" rel="noopener noreferrer">
              {selectedInstitution.url.replace(/^https?:\/\/(www\.)?/i, '')}
            </a></p>
            )}
          {/* {selectedInstitution.data_source && (
            <p className="mb-1">{selectedInstitution.data_source}</p>
          )} */}
        </footer>
      </div>
  );
};

export default InstitutionResults;