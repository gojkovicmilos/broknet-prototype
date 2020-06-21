const firebase = require("firebase");
const indicators  = require('technicalindicators');
// const tf = require('@tensorflow/tfjs-node');
const cron = require("node-cron");
const tf = require('@tensorflow/tfjs');


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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

let firestore = firebase.firestore();
let stocksDocRef = firebase.firestore().collection('stocks');

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

const updateStock = async (stockId, stock) => firestore.doc(`stocks/${stockId}`).update(stock);

const movingAverage = (stock, resolution) => {

    let avg = {};
    Object.keys(stock).forEach(key => {
        if(key != 'Date'){
            avg[key] = indicators.SMA.calculate({period: resolution, values: stock[key]});
        }
    });
    return avg;

};

const generateTradingData = (stock, resolution) => {

    const avgs = movingAverage(stock, resolution);

    let trainingData = {
            open: {x: [], y:[]},
            close: {x: [], y:[]},
            high: {x: [], y:[]},
            low: {x: [], y:[]},
            volume: {x: [], y:[]}
        }

    Object.keys(avgs).forEach((key, count) => {
            avgs[key].forEach(value => {
                trainingData[key].y.push(value);
                let xs = [];
                for(let i = count; i<count+resolution; i++){
                    xs.push(stock[key][i]);
                };
                trainingData[key].x.push(xs);
            })
        });

    return trainingData;


}


const trainModel = async (X, Y, window_size, n_epochs, learning_rate, n_layers, callback) =>{

    const input_layer_shape  = window_size;
    const input_layer_neurons = 100;
  
    const rnn_input_layer_features = 10;
    const rnn_input_layer_timesteps = input_layer_neurons / rnn_input_layer_features;
  
    const rnn_input_shape  = [rnn_input_layer_features, rnn_input_layer_timesteps];
    const rnn_output_neurons = 20;
  
    const rnn_batch_size = window_size;
  
    const output_layer_shape = rnn_output_neurons;
    const output_layer_neurons = 1;
  
    const model = tf.sequential();
  
    const xs = tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(10));
    const ys = tf.tensor2d(Y, [Y.length, 1]).reshape([Y.length, 1]).div(tf.scalar(10));
  
    model.add(tf.layers.dense({units: input_layer_neurons, inputShape: [input_layer_shape]}));
    model.add(tf.layers.reshape({targetShape: rnn_input_shape}));
  
    let lstm_cells = [];
    for (let index = 0; index < n_layers; index++) {
         lstm_cells.push(tf.layers.lstmCell({units: rnn_output_neurons}));
    }
  
    model.add(tf.layers.rnn({
      cell: lstm_cells,
      inputShape: rnn_input_shape,
      returnSequences: false
    }));
  
    model.add(tf.layers.dense({units: output_layer_neurons, inputShape: [output_layer_shape]}));
  
    model.compile({
      optimizer: tf.train.adadelta(learning_rate),
      loss: 'meanSquaredError'
    });
  
    const hist = await model.fit(xs, ys,
      { batchSize: rnn_batch_size, epochs: n_epochs, callbacks: {
        onEpochEnd: async (epoch, log) => {
          callback(epoch, log);
        }
      }
    });
  
    return { model: model, stats: hist };
  }
  
const makePredictions = (X, model) =>
  {
      const predictedResults = model.predict(tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(10))).mul(10);
      return Array.from(predictedResults.dataSync());
  }

const logger = (epoch, log) => {
    // console.log(log);
};


const prepData = stocks => {

    let nns = [];
    const histories = stocks.map(stock => stock.history);

    histories.forEach(history => {

        let newStock = {
            open: [],
            close: [],
            low: [],
            volume: [],
            high: []
        };

        history.map(obj => {
            newStock.open.push(obj.open);
            newStock.close.push(obj.close);
            newStock.high.push(obj.high);
            newStock.low.push(obj.low);
            newStock.volume.push(obj.volume);
        });

        nns.push(newStock);
    });
    return nns;
};

const getIndicators = nns => {
    nns.forEach((stock, i) => {
        console.log(
            {
                symbol: stocks[i].symbol,
                price: stocks[i].last,
                abandonedBaby: indicators.abandonedbaby(stock),
                eveningStar: indicators.eveningstar(stock),
                threeBlackCrows: indicators.threeblackcrows(stock),
                threeWhiteSoldiers: indicators.threewhitesoldiers(stock)
            });
        });
};

const run = async () =>
    cron.schedule('*/5 * * * *', async () => {
    let stocks = await getStocks();

    let nns = prepData(stocks);

    let td = [];

    nns.forEach((stock, i) => {  
        td.push(generateTradingData(stock, 110));

    });
    
    
    let predictions = [];
    
    
    for(let i=0; i<stocks.length; i++){

        const keys = Object.keys(stocks[0].history[0]);
        let stockPrediction = {}
        for(const key of keys){
            if(key != 'date' && key != 'volume'){
                const model = await trainModel(td[i][key].x, td[i][key].y, 110, 150, 0.01, 3, logger);
                let test = [];
                test.push(td[i][key].x[td[i][key].x.length-1]);
                let prediction = 
                {
                    prediction: makePredictions(test, model.model) - td[i][key].y[td[i][key].y.length-1],
                    accuracy: 1-model.stats.history.loss[model.stats.history.loss.length-1],          
                };
                stockPrediction[key] = prediction;
            }
        };

        await updateStock(stocks[i].id, {prediction: stockPrediction})
        predictions.push(stockPrediction);
    };
});


run();