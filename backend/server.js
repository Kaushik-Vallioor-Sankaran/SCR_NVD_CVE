const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

const mongoURI = 'mongodb://125003415:x6Px9mElONxdtlr6@cluster-shard-00-00.mongodb.net:27017,cluster-shard-00-01.mongodb.net:27017,cluster-shard-00-02.mongodb.net:27017/Cluster?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const cveSchema = new mongoose.Schema(
  {
    cveId: String,
    publishedDate: Date,
    lastModifiedDate: Date,
    description: String,
    baseScore: Number,
    year: Number,
  },
  { timestamps: true }
);
const CVE = mongoose.model('CVE', cveSchema);

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
