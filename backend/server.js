// Required packages
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

// App initialization
const app = express();
app.use(express.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/cve_DB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// CVE Schema and Model
const cveSchema = new mongoose.Schema({
  cveId: String,
  publishedDate: Date,
  lastModifiedDate: Date,
  description: String,
  baseScore: Number,
  year: Number,
}, { timestamps: true });
const CVE = mongoose.model('CVE', cveSchema);

// Helper function to fetch data from NVD API
async function fetchCVEData(startIndex = 0, resultsPerPage = 100) {
  try {
    const { data } = await axios.get('https://services.nvd.nist.gov/rest/json/cves/2.0', {
      params: {
        startIndex,
        resultsPerPage,
      },
    });
    return data.vulnerabilities || [];
  } catch (error) {
    console.error('Error fetching CVE data:', error);
    return [];
  }
}

// API Routes

// Route 1: Fetch all CVEs with filters and pagination
app.get('/cves/list', async (req, res) => {
  try {
    const {
      cveId,
      year,
      baseScore,
      lastModifiedDays,
      page = 1,
      limit = 10,
      sort = 'publishedDate',
      order = 'asc',
    } = req.query;

    const filter = {};
    if (cveId) filter.cveId = cveId;
    if (year) filter.year = parseInt(year);
    if (baseScore) filter.baseScore = { $gte: parseFloat(baseScore) };
    if (lastModifiedDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(lastModifiedDays));
      filter.lastModifiedDate = { $gte: cutoffDate };
    }

    const sortOption = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalRecords = await CVE.countDocuments(filter);
    const cves = await CVE.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit));

    res.json({ totalRecords, cves });
  } catch (error) {
    console.error('Error fetching CVE list:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route 2: Fetch single CVE details
app.get('/cves/:cveId', async (req, res) => {
  try {
    const { cveId } = req.params;
    const cve = await CVE.findOne({ cveId });
    if (!cve) return res.status(404).send('CVE not found');
    res.json(cve);
  } catch (error) {
    console.error('Error fetching CVE details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
