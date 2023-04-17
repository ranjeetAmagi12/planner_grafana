const express = require('express');

const client = require('prom-client');

const app = express();

const { Pool,Client} = require('pg');
require("dotenv").config();

const credentials = {
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
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
        const metrics = register_schedule_item_gauge();
        const pool = new Pool(credentials);
        let result = await getScheduleItemDetails( pool, metrics);
        await pool.end();
        res.send(result);
      //  res.send(client.generate_latest());
    } catch (error) {
        console.log(error);
    }
});

app.get('/cp_and_ms/metrics', async (req, res) => {
    try {
        const metrics = register_cp_and_ms_gauge();
        const pool = new Pool(credentials);
        let result = await getCpAndMsDetails( pool, metrics);
        await pool.end();
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});


app.get('/schedule_entry/metrics', async (req, res) => {
      try {
        const metrics = register_schedule_entry_gauge();
        const pool = new Pool(credentials);
        let result = await getScheduleEntryDetails( pool, metrics);
        await pool.end();
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});


app.get('/collection/metrics', async (req, res) => {
    try {
        const metrics = register_collection_gauge();
        const pool = new Pool(credentials);
        let result = await getCollectionDetails( pool, metrics);
        await pool.end();
        res.send(result);
    } catch (error) {
        console.log(error)
    }
});


function register_schedule_item_gauge() {
    return new client.Gauge({ name: 'item_schedule_details', help: ['id', 'schedule_entry_id', 'start_time', 'end_time', 'collection_id', 'tenant_id', 'feed_id', 'target_duration', 'created_at', 'updated_at'] });
};

function register_cp_and_ms_gauge() {
    return new client.Gauge({ name: 'cp_and_ms_details', help: ['tenant_id', 'cloudport_feed_id', 'account_name', 'platform_code'] });
};

function register_schedule_entry_gauge() {
    return new client.Gauge({ name: 'schedule_entry_details', help: ['id', 'start_date', 'end_date', 'target_duration','tenant_id', 'feed_id', 'created_at', 'updated_at'] });
};

function register_collection_gauge() {
    return new client.Gauge({ name: 'collection_details', help: ['id', 'tenant_id', 'feed_id','episode_target_duration','collection_type','created_at', 'updated_at'] });
};


async function getScheduleItemDetails(pool,metrics) {
    const text = "SELECT * FROM schedule_item ORDER BY id ASC LIMIT 100";
    let vals = await pool.query(text);
    let rows = vals.rows;
    for(let val of rows) {
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
        //metrics.hashMap.labels = resp;
        metrics.labelNames.push(resp);
    }
   // metrics.registers.item_schedule_details.labelNames = metrics.labelNames;
    console.log("end of getScheduleItemDetails");
    return metrics.labelNames;
  //  return metrics['schedule_item'].labels;
}


async function getCpAndMsDetails(pool,metrics) {
    const text = "SELECT * FROM cp_and_ms LIMIT 100";
    let vals =  await pool.query(text);
    let rows = vals.rows;
    for(let val of rows) {
        let resp = {
			tenant_id: val.tenant_id,
			cloudport_feed_id: val.cloudport_feed_id,
			account_name: val.account_name,
			platform_code: val.platform_code
	    };
        metrics.labelNames.push(resp);
    }
    console.log("end of getCpAndMsDetails");
    return metrics.labelNames;
}


async function getScheduleEntryDetails(pool,metrics) {
    const text = "SELECT * FROM schedule_entry ORDER BY id ASC LIMIT 100";
    let vals = await pool.query(text);
    let rows = vals.rows;
    for(let val of rows) {
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
        metrics.labelNames.push(resp);
    }
    console.log("end of getScheduleEntryDetails");
    return metrics.labelNames;
}

async function getCollectionDetails(pool,metrics) {
    const text = "SELECT * FROM collection ORDER BY id ASC LIMIT 100";
    let vals = await pool.query(text);
    let rows = vals.rows;
    for(let val of rows) {
        let resp = {
			id: val.id,
            tenant_id: val.tenant_id,
			feed_id: val.feed_id,
            episode_target_duration: val.episode_target_duration,
			collection_type: val.collection_type,
			created_at: val.created_at,
            updated_at: val.updated_at
	    };
        metrics.labelNames.push(resp);
    }
    console.log("end of getCollectionDetails");
    return metrics.labelNames;
}