// bring in the Twit package
const Twit = require("twit");

const config = require('./config.js');
const request = require("request");

var T = new Twit(config);

var url = "https://date.nager.at/Api/v2/NextPublicHolidaysWorldwide"

request('https://date.nager.at/Api/v2/AvailableCountries', gotCountries);
var countries;

function gotCountries(error, response, body) {
    countries = JSON.parse(body);

    // calling botTweet here is optional because setInterval will call it
    // but I added this line so I don't need to wait 5 minutes for the first tweet
    botTweet();

    // two parameters - 1. callback, 2. how many milliseconds between executing the 
    // callback function
    // i'm calling this function every 5 minutes
    setInterval(botTweet, 60*5*1000);
}

function botTweet(error, data, response){

    // this is the pure JavaScript version of loadJSON and gotData is our callback  
    request(url, gotData);

    // all code reliant on JSON from the API call must happen inside the gotData
    // function or we run the risk of using the data variable before the API call
     // is complete
    // because gotData is a callback, this function will only be executed after we
    // have successfully requested the data
    function gotData(error, response, body) {
        var data = JSON.parse(body);
        var tweet = "The next Public Holiday is " + data[0].name + " on " + data[0].date + " in " + getCountryName(data[0].countryCode);

        console.log(tweet);

        // T.post('statuses/update', {status: tweet}, tweeted);

        // this function let's us know if everything is OK - 
        // you could also look at your Twitter profile
        function tweeted(error, data, response){
            if(error){
            console.log(error);
            } else {
            console.log("You're doing great! " + data.text);
            }
        }
    }
}

function getCountryName(countryCode){
    for (var i=0; i<countries.length; i++) { 
        if (countries[i].key == countryCode) { 
            return countries[i].value;
        } 
    } 
}
