const express = require('express');

const client = require('prom-client');

const app = express();

//const port = process.env.PORT || 3001;

const { Pool,Client} = require('pg');

  const credentials = {
    user: 'newuser',
    host: 'localhost',
    database: 'postgres',
    password: 'newuser',
    port: 5432
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
        await getScheduleItemDetails( pool, metrics);
        //let result = getScheduleItemDetails(pool, metrics);
       // res.send(result);
        await pool.end();

        console.log("finished");
        return "hi";
      //  res.send(client.generate_latest());
    } catch (error) {
        console.log(error);
    }
    
   // return new Response(client.generate_latest());
});

app.get('/cp_and_ms/metrics', async (req, res) => {
    try {
        const metrics = register_cp_and_ms_gauge();

        const pool = new Pool(credentials);
        await getCpAndMsDetails( pool, metrics);
       // res.send(result);
        await pool.end();
    } catch (error) {
        console.log(error)
    }
    return new Response(client.generate_latest());
});


app.get('/schedule_entry/metrics', async (req, res) => {
      try {
        const metrics = register_schedule_entry_gauge();
        const pool = new Pool(credentials);
        await getScheduleEntryDetails( pool, metrics);
        await pool.end();
    } catch (error) {
        console.log(error)
    }
    return new Response(client.generate_latest());
});


app.get('/collection/metrics', async (req, res) => {
    try {
        const metrics = register_collection_gauge();
        const pool = new Pool(credentials);
        getCollectionDetails( pool, metrics);
        await pool.end();
    } catch (error) {
        console.log(error)
    }
    return new Response(client.generate_latest());
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
        metrics.hashMap.labels = resp;
        console.log("metrics resp "+ resp);
    }
    console.log("end of getScheduleItemDetails");
  //  return metrics['schedule_item'].labels;
    
    //return pool.query(text, values);
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
        metrics.hashMap.labels = resp;
        console.log("metrics resp "+ resp);
    }
    console.log("end of getCpAndMsDetails");
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
        metrics.hashMap.labels = resp;
        console.log("metrics resp "+ resp);
    }
    console.log("end of getScheduleEntryDetails");
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
        metrics.hashMap.labels = resp;
        console.log("metrics resp "+ resp);
    }
    console.log("end of getCollectionDetails");
}
