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

    // Determine elective coverage
    const isElectiveTreatmentCovered = selectedInstitution.is_elective_treament_covered;
    const electiveTreamentCoveredMessage = isElectiveTreatmentCovered
      ? "Elective treatments covered" 
      : isElectiveTreatmentCovered === false 
        ? "Elective treatments not covered" 
        : "Unknown elective treatment coverage";
  
  // Toggle functions for both collapsible sections
  const toggleBenefits = () => {
    setExpandedBenefits(!expandedBenefits);
  };

  const toggleOtherInfo = () => {
    setExpandedOtherInfo(!expandedOtherInfo);
  };

  const cleanSpecialCharacters = (text) => {
    if (!text) return '';
    
    // Replace problematic characters and remove pipe symbols that cause duplication
    return text
      .replace(/�/g, "'") // Replace � with apostrophe
      .replace(/\|/g, "") // Remove pipe characters that may cause duplication
      .replace(/[\u0080-\u009F\u00A0-\u00FF]/g, (match) => {
        // Replace common special characters with their ASCII equivalents
        const charMap = {
          '�': "'", // Various apostrophe/quote characters
          '�': '"',
          '�': '"',
          '�': '-',
          '�': '-'
        };
        return charMap[match] || match;
      });
  };

  // Add this helper function
  const parseDataMethod = (dataMethodString) => {
    if (!dataMethodString) return [];
    
    // Split the string by semicolons and trim each item
    return dataMethodString.split(';').map(method => method.trim()).filter(method => method.length > 0);
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
            {hasValue(selectedInstitution.maternal_leave_weeks) && (
              <div className="leave-info">
                <p className="leave-weeks mb-0">{maternalLeave}</p>
                <div className="leave-type">Maternal Leave</div>
              </div>
            )}
          </div>
          <div className="col-md-6">
            {hasValue(selectedInstitution.paternal_leave_weeks) && (
              <div className="leave-info">
                <p className="leave-weeks mb-0">{paternalLeave}</p>
                <div className="leave-type">Non-birthing Parental Leave</div>
              </div>
            )}
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
                    <li>${selectedInstitution.benefit_amount.toLocaleString()}</li>
                  )}
                  {selectedInstitution.limits_for_coverage === "No" && (
                    <li>No limits for coverage</li>
                  )}
                </ul>
              </>
            ) : hasFertilityBenefits === false ? (
              <p>{fertilityBenefitsMessage}</p>
            ) : (
              <p>No fertility benefits information available</p>
            )}
            <h4>Elective Coverage</h4>
            <p>{electiveTreamentCoveredMessage}</p>
            
            {selectedInstitution.benefits_offered && (
              <>
                <h4>Benefits Offered</h4>
                <div className="collapsible-section">
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
                    <p>{cleanSpecialCharacters(selectedInstitution.benefits_offered)}</p>
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
          <h4 className="mb-0">Source{parseDataMethod(selectedInstitution.data_method).length === 1 ? '' : 's'}</h4>
          {selectedInstitution.data_method && (
            <div className="mt-2">
              {(() => {
                const methods = parseDataMethod(selectedInstitution.data_method);
                
                if (methods.length === 1) {
                  // Single item - show as paragraph
                  return <p>{methods[0]}</p>;
                } else if (methods.length > 1) {
                  // Multiple items - show as list
                  return (
                    <ul className="data-method-list">
                      {methods.map((method, index) => (
                        <li key={index}>{method}</li>
                      ))}
                    </ul>
                  );
                } else {
                  // No items - show original
                  return <p>{selectedInstitution.data_method}</p>;
                }
              })()}
            </div>
          )}
        </footer>
      </div>
  );
};

export default InstitutionResults;