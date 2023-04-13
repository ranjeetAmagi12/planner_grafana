
//import {getScheduleItemDetails} from "./metric";

//let getScheduleItemDetails = require("./metric.ts");

const express = require('express');

const client = require('prom-client');

const app = express();

//const port = process.env.PORT || 3001;

const { Pool,Client} = require('pg');

const getcredentials =  async() => {
    return {
    user: "masteruser",
    host:"127.0.0.1",
    database: "postgres",
    password: "rwtDdPBAau^ugpTnF6-.oIv2LWF,wH",
    port: 5432
    };
  };


// Create a Registry to register the metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.listen(9100, () => {
    console.log("Metrics server started at http://localhost:9100");
  });

// Create a registry and pull default metrics
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

const metricsInterval = client.collectDefaultMetrics();

app.get('/schedule_item/metrics', async (req, res) => {
    try {
        //const register = new client.Registry();
        //const metric = client.collectDefaultMetrics({ register });
        const metrics = register_schedule_item_gauge();

//         const dbClient = new Client(getcredentials);
//   await dbClient.connect();
//   let id = 1;
//   let result = getScheduleItemDetails(id, dbClient, metrics);
  
  
        const pool = new Pool(getcredentials());
        let result = getScheduleItemDetails(pool, metrics);
        //console.log("schedule_item" + result.rows);
        res.send(result);
        await pool.end();
        //await dbClient.end();
    } catch (error) {
        console.log(error);
    }
    return new Response(client.generate_latest());
});

app.get('/cp_and_ms/metrics', async (req, res) => {
    try {
        // const register = new client.Registry();
        // const metrics = client.collectDefaultMetrics({ register });
        const metrics = register_cp_and_ms_gauge();

        const pool = new Pool(getcredentials());
        let result = getCpAndMsDetails( pool, metrics);
        //console.log("schedule_item" + result.rows);
        res.send(result);
        await pool.end();
    } catch (error) {
        console.log(error)
    }
    return new Response(client.generate_latest());
});


app.get('/schedule_entry/metrics', async (req, res) => {
      try {
        // const register = new client.Registry();
        // const metrics = client.collectDefaultMetrics({ register });
        
        const metrics = register_schedule_entry_gauge();
        const pool = new Pool(getcredentials());
        let result = getScheduleEntryDetails( pool, metrics);
        //console.log("schedule_item" + result.rows);
        res.send(result);
        await pool.end();
    } catch (error) {
        console.log(error)
    }
    return new Response(client.generate_latest());
});


app.get('/collection/metrics', async (req, res) => {
    try {
        // const register = new client.Registry();
        // const metrics = client.collectDefaultMetrics({ register });

        const metrics = register_collection_gauge();
        const pool = new Pool(getcredentials());
        let result = getCollectionDetails( pool, metrics);
        //console.log("schedule_item" + result.rows);
        res.send(result);
        await pool.end();
    } catch (error) {
        console.log(error)
    }
    return new Response(client.generate_latest());
});


function register_schedule_item_gauge() {
    return new Client.Gauge({ name: 'item_schedule_details', help: ['id', 'schedule_entry_id', 'start_time', 'end_time', 'collection_id', 'tenant_id', 'feed_id', 'target_duration', 'created_at', 'updated_at'] });
};


function register_cp_and_ms_gauge() {
    return new Client.Gauge({ name: 'cp_and_ms_details', help: ['tenant_id', 'cloudport_feed_id', 'account_name', 'platform_code'] });
};


function register_schedule_entry_gauge() {
    return new Client.Gauge({ name: 'schedule_entry_details', help: ['id', 'start_date', 'end_date', 'target_duration','tenant_id', 'feed_id', 'created_at', 'updated_at'] });
};


function register_collection_gauge() {
    return new Client.Gauge({ name: 'collection_details', help: ['id', 'tenant_id', 'feed_id','episode_target_duration','collection_type','created_at', 'updated_at'] });
};



async function getScheduleItemDetails(pool,metrics) {
    const text = `SELECT * FROM schedule_item`;
    console.log("text "+ text);
    let vals =  pool.query(text);
    for(let val of vals) {
        let resp = {
            id: val.id,
            schedule_entry_id: val.schedule_entry_id,
			start_time: val.start_time,
			end_time: val.end_time,
			collection_id: val.collection_id,
            tenant_id: val.tenant_id,
            feed_id: val.feed_id,
            target_duration: val.target_duration,
			created_at: val.created_at,
            updated_at: val.updated_at
	    };
        metrics['schedule_item'].labels = resp;
    }
    
  //  return metrics['schedule_item'].labels;
    
    //return pool.query(text, values);
}


async function getCpAndMsDetails(pool,metrics) {
    const text = `SELECT * FROM cp_and_ms`;
    console.log("text "+ text);
    let vals =  pool.query(text);
    for(let val of vals) {
        let resp = {
			tenant_id: val.tenant_id,
			cloudport_feed_id: val.cloudport_feed_id,
			account_name: val.account_name,
			platform_code: val.platform_code
	    };
        metrics['cp_and_ms'].labels = resp;
    }
}


async function getScheduleEntryDetails(pool,metrics) {
    const text = `SELECT * FROM schedule_entry`;
    console.log("text "+ text);
    let vals =  pool.query(text);
    for(let val of vals) {
        let resp = {
			id: val.id,
			start_date: val.start_date,
			end_date: val.end_date,
			target_duration: val.target_duration,
            tenant_id: val.tenant_id,
			feed_id: val.feed_id,
			created_at: val.created_at,
            updated_at: val.updated_at
	    };
        metrics['schedule_entry'].labels = resp;
    }
}

async function getCollectionDetails(pool,metrics) {
    const text = `SELECT * FROM collection`;
    console.log("text "+ text);
    let vals =  pool.query(text);
    for(let val of vals) {
        let resp = {
			id: val.id,
            tenant_id: val.tenant_id,
			feed_id: val.feed_id,
            episode_target_duration: val.episode_target_duration,
			collection_type: val.collection_type,
			created_at: val.created_at,
            updated_at: val.updated_at
	    };
        metrics['collection'].labels = resp;
    }
}
