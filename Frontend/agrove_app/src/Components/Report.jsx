// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Report = () => {
//   const [report, setReport] = useState(null);

//   useEffect(() => {
//     const fetchReport = async () => {
//       const token = localStorage.getItem('token');
//       const res = await axios.get('http://localhost:3000/api/fields/report', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setReport(res.data);
//     };
//     fetchReport();
//   }, []);

//   if (!report) return <p>Loading...</p>;

//   return (
//     <div>
//       <h2>Dashboard Summary</h2>
//       <pre>{JSON.stringify(report.reportSummary, null, 2)}</pre>

//       <h2>Field Details</h2>
//       <pre>{JSON.stringify(report.fieldReports, null, 2)}</pre>
//     </div>
//   );
// };

// export default Report;
