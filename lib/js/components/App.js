import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X } from 'lucide-react';

import InstitutionResult from './InstitutionResult';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const preventSuggestions = useRef(false);

  // Focus input field on initial load
  useEffect(() => {
    // Only focus if we're not on a mobile device to avoid showing keyboard
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile && inputRef.current && !selectedInstitution) {
      // Use setTimeout to defer focus until after React has finished rendering
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [selectedInstitution, loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using the exact endpoint you specified
        const response = await fetch('/api/institutions/');
        
        // Check for non-OK responses first
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Try to parse as JSON and catch any parsing errors
        let jsonResponse;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            // First try to read the text response to see what's coming back
            const textResponse = await response.text();
            console.error('Non-JSON response received:', textResponse.substring(0, 200) + '...');
            throw new Error(`Expected JSON response but got content-type: ${contentType}`);
          }
          
          // If we get here, we have a JSON content type, attempt to parse it
          const text = await response.text();
          try {
            jsonResponse = JSON.parse(text);
          } catch (jsonError) {
            console.error('Failed to parse JSON response. Raw response:', text.substring(0, 200) + '...');
            throw jsonError;
          }
        } catch (parseError) {
          // Handle JSON parsing errors specifically
          console.error('Response parsing error:', parseError);
          throw new Error('Unable to parse server response as JSON. The server might be returning an error page instead of JSON data.');
        }
        
        // Validate the response structure - adjust based on your actual response structure
        if (jsonResponse && Array.isArray(jsonResponse)) {
          // Direct array response
          setData(jsonResponse);
        } else if (jsonResponse && jsonResponse.data && Array.isArray(jsonResponse.data)) {
          // Object with data array
          setData(jsonResponse.data);
        } else {
          console.error('Unexpected response structure:', jsonResponse);
          throw new Error('The server response does not have the expected data format');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
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

  // References for suggestion list items
  const suggestionRefs = useRef([]);

  // Set up refs whenever suggestions change
  useEffect(() => {
    // Reset refs array with the current suggestions length
    suggestionRefs.current = suggestions.map(() => React.createRef());
  }, [suggestions]);

  // Focus suggestion item when selectedSuggestionIndex changes
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionRefs.current[selectedSuggestionIndex]) {
      suggestionRefs.current[selectedSuggestionIndex].current?.focus();
    } else if (selectedSuggestionIndex === -1 && inputRef.current) {
      // Return focus to input when deselecting
      inputRef.current.focus();
    }
  }, [selectedSuggestionIndex]);

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
  
  // Handler for suggestion item keyboard navigation
  const handleSuggestionKeyDown = (e, index, institution) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : -1
        );
        break;
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        handleInstitutionSelect(institution);
        break;
      case 'Escape':
        e.preventDefault();
        clearAllSuggestions();
        inputRef.current?.focus();
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
      <div className="alert alert-info">
        <p className="mb-0">Loading institution data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        <h4 className="alert-heading">Error Loading Data</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <>
      {selectedInstitution ? (
        <div className="card mt-4 mb-5">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h3">{selectedInstitution.name}</h2>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={clearSelection}
                aria-label="Clear selection"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <hr />
            <InstitutionResult selectedInstitution={selectedInstitution} />
          </div>
        </div>
      ) : (
        <>
          <div className="institution-search">
            <label htmlFor="institution-search" className="form-label d-block">FIND INSTITUTION</label>
            <input
              id="institution-search"
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Enter an institution name"
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
          </div>
          <div className="position-relative">
            {showSuggestions && suggestions.length > 0 && (
              <ul 
                id="search-suggestions"
                role="listbox"
                className="list-group mb-3 shadow-md"
              >
                {suggestions.map((institution, index) => (
                  <li
                    key={index}
                    id={`suggestion-${index}`}
                    ref={suggestionRefs.current[index]}
                    role="option"
                    tabIndex={index === selectedSuggestionIndex ? 0 : -1}
                    aria-selected={index === selectedSuggestionIndex}
                    className={`list-group-item list-group-item-action ${index === selectedSuggestionIndex ? 'active' : ''}`}
                    onClick={() => handleInstitutionSelect(institution)}
                    onKeyDown={(e) => handleSuggestionKeyDown(e, index, institution)}
                  >
                    <div className="name">{institution.name}</div>
                    <div className="description">
                      {institution.city}, {institution.state_name}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default App;