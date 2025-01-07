let currentPage = 1;
let resultsPerPage = 10;
let totalRecords = 0;

const fetchCveData = async () => {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${startIndex}&resultsPerPage=${resultsPerPage}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const cveItems = data.result.CVE_Items || [];
    totalRecords = data.result.totalResults || 0;

    document.getElementById('totalRecords').textContent = totalRecords;

    const tableBody = document.getElementById('cveTableBody');
    tableBody.innerHTML = ''; 
    cveItems.forEach(item => {
      const cve = item.cve;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cve.CVE_data_meta.ID}</td>
        <td>${item.publishedDate}</td>
        <td>${item.lastModifiedDate}</td>
        <td>${cve.description ? cve.description.description_data[0].value : 'No description'}</td>
        <td>${item.metrics.cvssMetricV3?.cvssData.baseScore || item.metrics.cvssMetricV2?.cvssData.baseScore}</td>
      `;
      tableBody.appendChild(row);
    });

    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage * resultsPerPage >= totalRecords;

  } catch (error) {
    console.error('Error fetching CVE data:', error);
  }
};

document.getElementById('resultsPerPage').addEventListener('change', (e) => {
  resultsPerPage = parseInt(e.target.value, 10);
  currentPage = 1; 
  fetchCveData();
});

document.getElementById('prevPageBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchCveData();
  }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
  if (currentPage * resultsPerPage < totalRecords) {
    currentPage++;
    fetchCveData();
  }
});

document.getElementById('filterByCveId').addEventListener('click', () => {
});

document.getElementById('filterByYear').addEventListener('click', () => {
});

document.getElementById('filterByScore').addEventListener('click', () => {
});

document.getElementById('filterByLastModified').addEventListener('click', () => {
});

fetchCveData();
