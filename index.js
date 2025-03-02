const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { ethers } = require('ethers');

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public'))); // ✅ Fix here

const cors = require('cors');
app.use(cors({ origin: '*' }));

const stakeRouter = require('./routes/stake');
const wrapRouter = require('./routes/wrap');
const balanceRouter = require('./routes/balance');
const stWrapRouter = require('./routes/stETH')
const unWrapRouter = require('./routes/unwrap')
const withdrawRouter = require('./routes/withdraw')
const statisticsRouter = require('./routes/statistics')

app.use('/api/stake', stakeRouter);
app.use('/api/wrap', wrapRouter);
app.use('/api/balance', balanceRouter); 
app.use('/api/stETH', stWrapRouter); 
app.use('/api/unwrap', unWrapRouter); 
app.use('/api/withdraw', withdrawRouter); 
app.use('/api/statistics', statisticsRouter); 
app.get("/", (req, res) => res.send("Express on Azure"));
app.get('/.well-known/ai-plugin.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public/.well-known/ai-plugin.json'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Lido AI Agent Running on port : ${port}`);
});
