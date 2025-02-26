import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

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
        const response = await fetch('http://localhost:3000/api/institutions');
        
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
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase())
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
          setSearchTerm(selected.name);
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
    setSearchTerm(institution.name);
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading benefits data...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <label className="block text-lg font-semibold mb-2">INSTITUTION</label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full pl-10 pr-12 py-3 text-lg border rounded-lg bg-gray-50"
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
                className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-200"
                aria-label="Clear search"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <ul 
              id="search-suggestions"
              role="listbox"
              className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10"
            >
              {suggestions.map((institution, index) => (
                <li
                  key={index}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === selectedSuggestionIndex}
                  className={`px-4 py-3 cursor-pointer border-b last:border-b-0 ${
                    index === selectedSuggestionIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleInstitutionSelect(institution)}
                >
                  <div className="font-medium">{institution.name}</div>
                  <div className="text-sm text-gray-600">
                    {institution.city}, {institution.state_name}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedInstitution && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="font-semibold text-xl mb-6">PAID LEAVE</h2>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-gray-600 mb-2">maternal leave</div>
              <div className="text-2xl font-semibold">
                {selectedInstitution.maternal_leave_weeks} weeks
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-2">paternal leave</div>
              <div className="text-2xl font-semibold">
                {selectedInstitution.paternal_leave_weeks} weeks
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-xl">FERTILITY BENEFITS</h2>
            {selectedInstitution.has_fertility_benefits === 1 ? (
              <div className="text-green-600 text-xl">✓</div>
            ) : selectedInstitution.has_fertility_benefits === 0 ? (
              <div className="text-red-600 text-xl">✗</div>
            ) : (
              <div className="text-gray-600 text-xl">?</div>
            )}
          </div>
          <div className="mb-8">
            {selectedInstitution.has_fertility_benefits === 1 ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Coverage Details</h3>
                  {selectedInstitution.benefit_amount && (
                    <div className="mt-2 font-medium">
                      Benefit amount: ${selectedInstitution.benefit_amount.toLocaleString()}
                    </div>
                  )}
                  {selectedInstitution.elective_treatment_covered && (
                    <div className="mt-2">
                      <span className="font-medium">Elective treatments: </span>
                      {selectedInstitution.elective_treatment_covered}
                    </div>
                  )}
                </div>
                {selectedInstitution.fertility_benefits_notes && (
                  <div className="mt-2 text-gray-700">
                    <h3 className="font-medium text-gray-900">Additional Notes</h3>
                    <div className="mt-1">
                      {selectedInstitution.fertility_benefits_notes}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedInstitution.has_fertility_benefits === 0 ? (
              <div className="text-gray-700">
                No fertility benefits are currently offered at this institution.
              </div>
            ) : (
              <div className="text-gray-700">
                Fertility benefits information is unknown for this institution.
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <div>Source:</div>
            {selectedInstitution.url && (
              <a 
                href={selectedInstitution.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {selectedInstitution.url}
              </a>
            )}
            {selectedInstitution.data_source && (
              <div className="mt-1">
                Data source: {selectedInstitution.data_source}
              </div>
            )}
            {selectedInstitution.data_method && (
              <div>
                Collection method: {selectedInstitution.data_method}
              </div>
            )}
            <div className="mt-2">
              {selectedInstitution.name}<br />
              {selectedInstitution.address_1} {selectedInstitution.address_2}<br />
              {selectedInstitution.city}, {selectedInstitution.state_name} {selectedInstitution.postal_code}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BenefitsExplorer;