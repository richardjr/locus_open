

const load = require('./load_os_opendata');

const express = require('express');

// Constants
const PORT = 9002;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
global.result = {status: 'complete'};

app.post('/', async (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    //Only allow one load at a time currently
    if(result.status !== 'complete'){
        res.end(JSON.stringify({message : "Another load in progress please wait until complete", status : result.status, product : result.product}))
    }

    //some of these operations can take a long time so we return immediately
    res.end(JSON.stringify({message : "Load in progress"}));

    //This is fine as long as only one call made
    result.status = 'processing';
    await load.loadOSOpenData(req.body);
    result.status = 'complete';
});

app.post('/status', (req,res)=> {

    res.send(JSON.stringify(result));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);