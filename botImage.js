
// bring in the Twit package
const Twit = require("twit");

const config = require('./config.js');
const request = require("request");
const fs = require("fs");

var T = new Twit(config);

request('https://date.nager.at/Api/v2/AvailableCountries', gotCountries);
var countries;
var currCountry;

var tweet_text;

var url = "https://date.nager.at/Api/v2/NextPublicHolidaysWorldwide"



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
        currCountry = getCountryName(data[0].countryCode);
        tweet_text = "The next Public Holiday is " + data[0].name + " on " + data[0].date + " in " + currCountry;

        var flag_url = "http://www.geognos.com/api/en/countries/flag/" + data[0].countryCode + ".png"
        download(flag_url, "images/" + currCountry + ".png");
    }

    function download(url, filename){
    	// this is downloading the image from the url to our images folder
  		// when the download is complete, it will call the finished function
  		request(url).pipe(fs.createWriteStream(filename)).on('close', finished);

  		function finished(){
  			// Twitter will only post images with base64 encoding, so we need to
    		// encode our newly downloaded image
    		var encoded_img = fs.readFileSync(filename, {encoding: 'base64'});

    		// post just the encoded image
          	// call the uploaded function when we're done
          	T.post('media/upload', {media_data: encoded_img}, uploaded);
        }
    }

    function uploaded(error, data, response){
    	// get the id assocaited with the posted image
  		// we'll use the id to attach it to our tweet
 		var mediaIdStr = data.media_id_string;
  		var altText = "An image of " + currCountry + " flag";
  		var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

    	// post the metadata, call createMedia function when done
  		T.post('media/metadata/create', meta_params, createdMedia);

	    function createdMedia(error, data, response){
	        // route (what are we doing?)
	        // post is a type of request
	        // post is creating a NEW object
	        var tweet_params = {status: tweet_text, media_ids: mediaIdStr};
	        T.post('statuses/update', tweet_params, tweeted);
	    }
    }

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

function getCountryName(countryCode){
    for (var i=0; i<countries.length; i++) { 
        if (countries[i].key == countryCode) { 
            return countries[i].value;
        } 
    } 
}
