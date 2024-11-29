const express = require("express")

const axios = require("axios");

const app = express();
const PORT = 3000;

//CHECKLIST RULES FOR GIVEN CONDISATION

const checklistRules= [
    {
        name: "Valuation Fee Paid",
        condition:(data)=> data.isValuationFeePaid === true,
    },
    {
        name: "Uk Resident",
        condition:(data)=> data.isUkResident === true,
    },
    {
        name: "Risk Rating Medium",
        condition:(data)=> data.isRatingRisk === "Medium",
    },
    {
        name: "LTV Below 60%",
        condition:(data)=> ((data.loanRequired / data.purchasePrice) * 100).toFixed(2) < 60,
    },
];

// Fetch application data
const fetchApplicationData = async () => {
  const apiURL =
    "http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639";
  try {
    const response = await axios.get(apiURL);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return null;
  }
};


// Evaluate rules for checking 
const evaluateChecklist = (data) => {
    return checklistRules.map((rule) => ({
      ruleName: rule.name,
      status: rule.condition(data) ? "Passed" : "Failed",
    }));
  };
  
  // to checking the status of rules and display the status server side
  
  app.get("/", async (req, res) => {
    const applicationData = await fetchApplicationData();
    if (!applicationData) {
      return res.status(500).send("Error fetching application data");
    }
  
    const evaluationResults = evaluateChecklist(applicationData);
    let html = `
      <html>
      <head>
        <title>Checklist Evaluation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2a1814; padding:20px; text-align: center; width:50%; margin: auto;  background-color: #f2d609; box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;}
          table { border-collapse: collapse; width: 40%; margin: 80px auto; box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;}
          th, td { border: 2px solid #ccc; padding: 10px; text-align: center; border-color:#333}
          th { background-color: #f4f4f4;  color:#0934f2; text-align:center;}
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>**Checklist Evaluation**</h1>
        <table>
          <tr>
            <th>Rule</th>
            <th>Status</th>
          </tr>
          ${evaluationResults
            .map(
              (result) => `
            <tr>
              <td>${result.ruleName}</td>
              <td>${result.status}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </body>
      </html>
    `;
    res.send(html);
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });