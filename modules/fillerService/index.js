const firebase = require("firebase");
const parser = require('fast-xml-parser');
const fetch = require('node-fetch');
const cron = require("node-cron");

const firebaseConfig = {
    apiKey: "AIzaSyDUwCTNwbK65aouZCO0sAzU50dE9X5b578",
    authDomain: "broknet-684ba.firebaseapp.com",
    databaseURL: "https://broknet-684ba.firebaseio.com",
    projectId: "broknet-684ba",
    storageBucket: "broknet-684ba.appspot.com",
    messagingSenderId: "45171908800",
    appId: "1:45171908800:web:eaccd95033d45d85cd8d25",
    measurementId: "G-73RQDWR7KT"
};

const financialHeader = { 'Authorization': 'Bearer iFX1eNAyOxWMW9DKhNwguHF3wPnX' };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();
let stocksDocRef = firebase.firestore().collection('stocks');

const updateStock = async (stockId, stock) => firestore.doc(`stocks/${stockId}`).update(stock);


const getStocks = () =>
    stocksDocRef
        .get()
        .then((querySnapshot) => {
            let list = [];
            querySnapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            return list;
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

const getStockApi = async symbol => {
    try {
        const data = await fetch(`https://sandbox.tradier.com/v1/markets/quotes?symbols=${symbol}`, { headers: { 'Authorization': 'Bearer iFX1eNAyOxWMW9DKhNwguHF3wPnX' } });
        const dataJSON = parser.parse(await data.text()).quotes.quote;
        return dataJSON;
    } catch (error) {
        console.log(error);
    }
};

const getStockHistory = async symbol => {
    try {
        const data = await fetch(`https://sandbox.tradier.com/v1/markets/history?symbol=${symbol}&start=2020-01-01`, { headers: { 'Authorization': 'Bearer iFX1eNAyOxWMW9DKhNwguHF3wPnX' } });
        const dataJSON = parser.parse(await data.text()).history.day;
        return dataJSON;
    } catch (error) {
        console.log(error);
    }
};



const stocks = () => {
    cron.schedule('*/20 * * * *', async () => {
        const stocks = await getStocks();
        for (const stock of stocks) {
            const sd = await getStockApi(stock.symbol);
            try {
                await updateStock(stock.id, sd);
                console.log(`Stock ${stock.symbol} updated!`)
            } catch (error) {
                console.log(error);
            };
        };
    });
};
const history = () => {
    cron.schedule('25 17 * * *', async () => {
        const stocks = await getStocks();
        for (const stock of stocks) {
            const sd = await getStockHistory(stock.symbol);
            try {
                await updateStock(stock.id, { history: sd });
                console.log(`Stock ${stock.symbol} history updated!`)
            } catch (error) {
                console.log(error);
            };
        }
    });
};



const run = () => {
    stocks();
    history();
}

run();
