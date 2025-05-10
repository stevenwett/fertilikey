import React, { useState, useRef, useEffect } from 'react';

const InstitutionResults = ({ selectedInstitution }) => {
  const [expandedBenefits, setExpandedBenefits] = useState(false);
  const [expandedOtherInfo, setExpandedOtherInfo] = useState(false);
  const benefitsRef = useRef(null);
  const otherInfoRef = useRef(null);
  
  // Initialize tooltips after component mounts or updates
  useEffect(() => {
    const initializeTooltips = () => {      
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    };
  
    // Run once DOM is fully loaded
    if (document.readyState === 'complete') {
      initializeTooltips();
    } else {
      window.addEventListener('DOMContentLoaded', initializeTooltips);
      window.addEventListener('load', initializeTooltips);
    }
    
    return () => {
      window.removeEventListener('DOMContentLoaded', initializeTooltips);
      window.removeEventListener('load', initializeTooltips);
      
      // Cleanup tooltips
      if (typeof $ !== 'undefined') {
        $('[data-bs-toggle="tooltip"]').tooltip('dispose');
      }
    };
  }, [selectedInstitution]);
  
  if (!selectedInstitution) {
    return (
      <div className="alert alert-info mt-4">
        <p className="mb-0">We currently only have data for institutions with Ob/Gyn or Plastic Surgery programs</p>
      </div>
    );
  }

  // Helper to determine if a value exists (including zero)
  const hasValue = (value) => value !== null && value !== undefined;

  // Determine display values for different leave types
  const maternalLeave = hasValue(selectedInstitution.maternal_leave_paid_weeks) 
    ? `${selectedInstitution.maternal_leave_paid_weeks} Week${selectedInstitution.maternal_leave_paid_weeks > 1 ? 's' : ''}` 
    : "Unknown";
  
  const paternalLeave = hasValue(selectedInstitution.paternal_leave_paid_weeks) 
    ? `${selectedInstitution.paternal_leave_paid_weeks} Week${selectedInstitution.paternal_leave_paid_weeks > 1 ? 's' : ''}` 
    : "Unknown";

  // Determine fertility benefits display
  let hasFertilityBenefitsRaw = selectedInstitution.has_fertility_benefits;
  let hasFertilityBenefits = null;

  if (hasFertilityBenefitsRaw !== "" && hasFertilityBenefitsRaw !== null && hasFertilityBenefitsRaw !== undefined) {
    hasFertilityBenefits = parseInt(hasFertilityBenefitsRaw, 10);
  }

  let fertilityBenefitsMessage;
  if (hasFertilityBenefits === 1) {
    fertilityBenefitsMessage = "Yes, benefits offered";
  } else if (hasFertilityBenefits === 0) {
    fertilityBenefitsMessage = "No benefits offered";
  } else {
    fertilityBenefitsMessage = "No fertility benefits information found";
  }

  // Determine elective coverage
  const isElectiveTreatmentCovered = selectedInstitution.is_elective_treatment_covered;

  // Define the message using useMemo
  const electiveTreatmentCoveredMessage = React.useMemo(() => {
    // Explicitly check for string "1"
    if (String(isElectiveTreatmentCovered) === "1") {
      return "Yes";
    }
    // Explicitly check for string "0" 
    else if (String(isElectiveTreatmentCovered) === "0") {
      return "No";
    }
    // All other cases (including empty string) are "Unknown"
    else {
      return "Unknown";
    }
  }, [selectedInstitution.is_elective_treatment_covered]);
  
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
  
  // Function to detect and convert URLs in text to anchor tags
  const linkifyText = (text) => {
    if (!text) return '';
    
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Replace URLs with anchor tags
    return text.replace(urlRegex, url => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  // Text formatter that handles paragraphs and list items
  const formatFertilityText = (text) => {
    if (!text) return '';
    
    // Normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split into paragraphs (blocks separated by empty lines)
    const paragraphs = normalizedText.split(/\n\s*\n/);
    
    let html = '';
    
    // Process each paragraph
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;
      
      const lines = paragraph.trim().split('\n');
      
      // Check if this paragraph contains list items (lines with asterisks)
      const hasListItems = lines.some(line => 
        line.trim().startsWith('*') || line.trim().endsWith('*')
      );
      
      if (hasListItems) {
        // Process as a list
        html += '<ul class="mb-3">';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('*')) {
            // Asterisk at beginning
            const content = trimmedLine.substring(1).trim();
            html += `<li>${content}</li>`;
          } else if (trimmedLine.endsWith('*')) {
            // Asterisk at end
            const content = trimmedLine.substring(0, trimmedLine.length - 1).trim();
            html += `<li>${content}</li>`;
          } else {
            // Regular line in a list paragraph - treat as a list item too
            html += `<li>${trimmedLine}</li>`;
          }
        }
        
        html += '</ul>';
      } else {
        // Process as regular paragraph
        if (lines.length === 1) {
          // Single line paragraph
          html += `<p>${lines[0].trim()}</p>`;
        } else {
          // Multi-line paragraph
          html += `<p>${lines.join('<br>')}</p>`;
        }
      }
    }
    
    return html;
  };
  
  return (
    <div>
      <section className="mb-3">
        <h3>
          Paid Leave
          <span
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title="Per the ACGME: Residents/fellows receive a minimum of 6 weeks of paid medical, parental, and caregiver leave at 100% salary at least once during their ACGME-accredited program.">
            {(hasValue(selectedInstitution.maternal_leave_paid_weeks) && selectedInstitution.maternal_leave_paid_weeks > 0) || 
            (hasValue(selectedInstitution.paternal_leave_paid_weeks) && selectedInstitution.paternal_leave_paid_weeks > 0) ? (
              <i className="bi bi-check-circle text-success ms-2"></i>
            ) : (hasValue(selectedInstitution.maternal_leave_paid_weeks) && selectedInstitution.maternal_leave_paid_weeks === 0) || 
              (hasValue(selectedInstitution.paternal_leave_paid_weeks) && selectedInstitution.paternal_leave_paid_weeks === 0) ? (
              <i className="bi bi-x-circle text-danger ms-2"></i>
            ) : (
              <i className="bi bi-question-circle text-secondary ms-2"></i>
            )}
          </span>
        </h3>
        <div className="row">
          <div className="col-md-6">
          <div className="leave-info">
            <p className="leave-weeks mb-0">{maternalLeave}</p>
            <div className="leave-type">Maternal Leave</div>
          </div>
          </div>
          <div className="col-md-6">
            <div className="leave-info">
              <p className="leave-weeks mb-0">{paternalLeave}</p>
              <div className="leave-type">Non-birthing Parental Leave</div>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-3">
        <h3>
          Fertility Benefits
          <span  
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title="Benefits may include diagnostic testing, treatment of underlying condition causing infertility, ovulation induction, and/or IVF"
          >
            {hasFertilityBenefits ? (
              <i className="bi bi-check-circle text-success ms-2"></i>
            ) : hasFertilityBenefits === false ? (
              <i className="bi bi-x-circle text-danger ms-2"></i>
            ) : (
              <i className="bi bi-question-circle text-secondary ms-2"></i>
            )}
          </span>
        </h3>
        {hasFertilityBenefits === 1 ? (
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
        ) : hasFertilityBenefits === 0 ? (
          <p>{fertilityBenefitsMessage}</p>
        ) : (
          <p>No fertility benefits information found</p>
        )}
      </section>
      <section className="mb-3">
        <h3>
          Elective Treatment Covered?
          <span
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-html="true"
            title="Treatments may include elective oocyte and/or embryo cryopreservation. Please verify with your individual institution"
          >
            <i className="bi bi-question-circle text-secondary ms-2"></i>
          </span>
        </h3>
        <p>{electiveTreatmentCoveredMessage}</p>
      </section>
      <section className="mb-3">
        {selectedInstitution.benefits_offered && (() => {
          const benefitsText = formatFertilityText(cleanSpecialCharacters(selectedInstitution.benefits_offered));
          const charactersVisible = 150; // Approximate number of characters visible in 3em height
          const needsExpansion = benefitsText.length > charactersVisible;
          
          return (
            <>
              <h3>Benefits Offered</h3>
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
                  {/* Use a div instead of p to avoid nesting issues */}
                  <div className="benefits-content" dangerouslySetInnerHTML={{ __html: benefitsText }} />
                </div>
                {/* Only show the button if there's more content than what's initially visible */}
                {needsExpansion && (
                  <button 
                    className="btn btn-sm btn-link p-0 mt-1" 
                    onClick={toggleBenefits}
                  >
                    {expandedBenefits ? 'Show Less' : 'Read More'} 
                    <i className={`bi bi-chevron-${expandedBenefits ? 'up' : 'down'} ms-1`}></i>
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </section>
      <footer>
        <hr />
        {selectedInstitution.data_method && parseDataMethod(selectedInstitution.data_method).length > 0 && (
          <>
            <h4 className="mb-1">Source{parseDataMethod(selectedInstitution.data_method).length === 1 ? '' : 's'}</h4>
            <div>
              {(() => {
                const methods = parseDataMethod(selectedInstitution.data_method);
                
                if (methods.length === 1) {
                  // Single item - show as paragraph with link support
                  return <p dangerouslySetInnerHTML={{ __html: linkifyText(methods[0]) }} />;
                } else if (methods.length > 1) {
                  // Multiple items - show as list with link support
                  return (
                    <ul className="data-method-list">
                      {methods.map((method, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: linkifyText(method) }} />
                      ))}
                    </ul>
                  );
                } else {
                  // No items - show original with link support
                  return <p dangerouslySetInnerHTML={{ __html: linkifyText(selectedInstitution.data_method) }} />;
                }
              })()}
            </div>
          </>
        )}
        <p className="mb-0 mt-3"><a className="small text-black-50" href="https://docs.google.com/forms/d/e/1FAIpQLSdmXi7vv6apH9F_0I7JvfRpD9JS94gLnmXGpCpojcQfpYRq7g/viewform">REPORT FEEDBACK</a></p>
      </footer>
    </div>
  );
};

export default InstitutionResults;