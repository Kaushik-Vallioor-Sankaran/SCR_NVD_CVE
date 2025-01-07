import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './App.css';

const App = () => {
  const [cveData, setCveData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const fetchCveData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${(page - 1) * resultsPerPage}&resultsPerPage=${resultsPerPage}`
      );
      const data = await response.json();
      setCveData(data.result.CVE_Items || []);
      setTotalRecords(data.result.totalResults || 0);
    } catch (err) {
      setError('Error fetching data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCveData();
  }, [page, resultsPerPage]);

  const handleRowClick = (cveId) => {
    history.push(`/cves/${cveId}`);
  };

  return (
    <div className="App">
      <h1>CVE List</h1>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>CVE ID</th>
                <th>CVSS Score</th>
                <th>Last Modified</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {cveData.map((cve) => (
                <tr key={cve.cve.CVE_data_meta.ID} onClick={() => handleRowClick(cve.cve.CVE_data_meta.ID)}>
                  <td>{cve.cve.CVE_data_meta.ID}</td>
                  <td>{cve.metrics.cvssMetricV3?.cvssData.baseScore || cve.metrics.cvssMetricV2?.cvssData.baseScore}</td>
                  <td>{cve.lastModifiedDate}</td>
                  <td><button>View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <div>Total Records: {totalRecords}</div>
            <div>
              Results Per Page:
              <select
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span> Page {page} </span>
            <button disabled={totalRecords <= page * resultsPerPage} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
