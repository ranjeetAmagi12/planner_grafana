declare var require: any
// const { Pool,Client} = require('pg');
// const dotenv = require('dotenv');
// dotenv.config();

// const getcredentials =  async() => {
//     return {
//     user: "masteruser",
//     host: "amagi-planner-infra-main-postgrescluster70f03177-hhb20fnfwrie.cluster-cfjpuy9sfh5q.us-east-1.rds.amazonaws.com",
//     database: "postgres",
//     password: "rwtDdPBAau^ugpTnF6-.oIv2LWF,wH",
//     port: 5432
//     };
//   };

  
// const connectDb = async () => {
//     try {
//         const pool = new Pool(getcredentials());
//         await pool.connect();
//         const res = await pool.query('SELECT * FROM clients');
//         console.log(res)
//         await pool.end();
//     } catch (error) {
//         console.log(error)
//     }
// }

//connectDb()