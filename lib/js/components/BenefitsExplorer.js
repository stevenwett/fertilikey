import React, { useState, useEffect, useRef } from 'react';

// Simple function to display benefits without complex formatting
const displayBenefits = (benefits) => {
  if (!benefits) return "No detailed information available";
  return benefits;
};

const BenefitsExplorer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const preventSuggestions = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/institutions');
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (preventSuggestions.current) {
      preventSuggestions.current = false;
      return;
    }

    if (searchTerm.length > 2) {
      const filtered = data
        .filter(item => 
          item.SponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.SponsorCity?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, data]);

  const clearAllSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : -1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          preventSuggestions.current = true;
          const selected = suggestions[selectedSuggestionIndex];
          setSelectedInstitution(selected);
          setSearchTerm(selected.SponsorName);
          clearAllSuggestions();
        }
        break;
      case 'Escape':
        e.preventDefault();
        clearAllSuggestions();
        break;
      default:
        break;
    }
  };

  const handleInstitutionSelect = (institution) => {
    preventSuggestions.current = true;
    setSelectedInstitution(institution);
    setSearchTerm(institution.SponsorName);
    clearAllSuggestions();
  };

  const clearSelection = () => {
    setSelectedInstitution(null);
    setSearchTerm('');
    clearAllSuggestions();
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <main>
        <div role="status">
          <p>Loading benefits data...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>FertiliKey MD</h1>
        <p>Find fertility benefits at ACGME teaching institutions in the US</p>
      </header>

      <section aria-labelledby="search-heading">
        <h2 id="search-heading">Search for an Institution</h2>
        <div>
          <label htmlFor="institution-search">Institution name</label>
          <div>
            <span aria-hidden="true">🔍</span>
            <input
              ref={inputRef}
              id="institution-search"
              type="text"
              placeholder="Name of institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-autocomplete="list"
              aria-controls={showSuggestions ? "search-suggestions" : undefined}
              aria-expanded={showSuggestions}
              aria-activedescendant={
                selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined
              }
            />
            {searchTerm && (
              <button
                onClick={clearSelection}
                aria-label="Clear search"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <ul id="search-suggestions" role="listbox">
              {suggestions.map((institution, index) => (
                <li
                  key={index}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === selectedSuggestionIndex}
                  onClick={() => handleInstitutionSelect(institution)}
                >
                  <div>{institution.SponsorName}</div>
                  <div>
                    {institution.SponsorCity}, {institution.SponsorStateName}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {selectedInstitution && (
        <article aria-labelledby="institution-details">
          <h2 id="institution-details">{selectedInstitution.SponsorName} Benefits</h2>
          
          <section aria-labelledby="leave-heading">
            <h3 id="leave-heading">Paid Leave</h3>
            <dl>
              <div>
                <dt>Maternal leave</dt>
                <dd>{selectedInstitution['Maternal leave (wks)']} weeks</dd>
              </div>
              <div>
                <dt>Paternal leave</dt>
                <dd>{selectedInstitution['Paternal leave (wks)']} weeks</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="fertility-heading">
            <h3 id="fertility-heading">Fertility Benefits</h3>
            {selectedInstitution['Fertility Benefits offered? (Yes/No)'] === 'Yes' ? (
              <>
                <p>Fertility benefits are available at this institution.</p>
                <div>
                  <h4>Coverage Details</h4>
                  <div>
                    <p>{displayBenefits(selectedInstitution['Type of benefits offered  (lifetime benefit, fertility insurance ie progyny)'])}</p>
                    {selectedInstitution['Limits for coverage (elective, oocyte and/or embryo, PGT)'] && 
                      <p>Coverage limits: {selectedInstitution['Limits for coverage (elective, oocyte and/or embryo, PGT)']}</p>
                    }
                    {selectedInstitution['Other details'] && 
                      <p>Additional information: {selectedInstitution['Other details']}</p>
                    }
                  </div>
                </div>
              </>
            ) : (
              <p>Fertility benefits are not available at this institution.</p>
            )}
          </section>

          <footer>
            <h4>Source Information</h4>
            {selectedInstitution.SponsorUrl && (
              <a 
                href={selectedInstitution.SponsorUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {selectedInstitution.SponsorUrl}
              </a>
            )}
            <address>
              {selectedInstitution.SponsorName}<br />
              {selectedInstitution.AddressLine1} {selectedInstitution.AddressLine2}<br />
              {selectedInstitution.SponsorCity}, {selectedInstitution.SponsorStateName} {selectedInstitution.SponsorPostalCode}
            </address>
          </footer>
        </article>
      )}
    </main>
  );
};

export default BenefitsExplorer;