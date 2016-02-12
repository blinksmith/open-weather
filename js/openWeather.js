/*!
Name: Open Weather
Dependencies: jQuery, OpenWeatherMap API
Author: Michael Lynch
Author URL: http://michaelynch.com
Date Created: August 28, 2013
Date Modified: February 12, 2016
Modified by: blinksmith
Licensed under the MIT license
*/

;(function($) {
//'usestrict';
 $.fn.openWeather = function(options) {

 //return if no element was bound
 //so chained events can continue
 if(!this.length) {
  return this;
 }

 //define default parameters
 var defaults = {
   iconTarget: null,
   customIcons: null,
   lat: null,
   lng: null,
   city: null,
   key: null,
   lang: 'en',
   kFlickr: null,
   k500px: null,
   success: function() {},
   error: function(message) {} 
 } 

 //define plugin, element, api URL
 var plugin = this;
 var el = $(this);
 var apiURL;

 //define settings, merge defaults and options
 plugin.settings = {} 
 plugin.settings = $.extend({}, defaults, options);
    
 //define settings namespace
 var s = plugin.settings;
    
 //define basic api endpoint
 apiURL = '//api.openweathermap.org/data/2.5/weather?lang=' + s.lang;

 //if isn't null, define API url using city or latitude and longitude
 if(s.lat != null && s.lng != null) {
    apiURL += '&lat=' + s.lat + '&lon=' + s.lng;
 } else if(s.city != null) {
    apiURL += '&q=' + s.city.replace(' ', '');
 }

 //if api key was supplied append api key paramater
 if(s.key != null) {
    apiURL += '&appid=' + s.key;
 }

 //format time function
   var formatTime = function(unixTimestamp) {
       var milliseconds = unixTimestamp * 1000;
       var date = new Date(milliseconds);
       var hours = date.getHours();
       if(hours > 12) {
          hoursRemaining = 24 - hours;
          hours = 12 - hoursRemaining;
       }   
       var minutes = date.getMinutes();
       minutes = minutes.toString();
       if(minutes.length < 2) {
          minutes = 0 + minutes;
       }
       var time = hours + ':' + minutes;
       return time;
   }
 
 // console.log(apiURL); 
 
 $.ajax({
   type: 'GET',
   url: apiURL,
   dataType: 'jsonp',
   success: function(data) {

    //set bacgroundImage
    var toSearch = data.weather[0].description; 
    if(s.k500px != null && s.backgroundImage == 'use500px') {
      $.getJSON('https://api.500px.com/v1/photos/search?consumer_key=' + s.k500px + '&term=' + toSearch + '&feature=popular&image_size=1080&only=8&rpp=10',
        function(data){
        var item = data.photos[ Math.floor( Math.random() * data.photos.length ) ];
        var photoURL = item.images[0].url;
        $('html').css('background','url(' + photoURL + ') no-repeat center center fixed');
        $('html').css('background-size','cover');
        }) 
    } else if(s.kFlickr != null && s.backgroundImage == 'useFlickr') {
      $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + s.kFlickr + '&text=' + toSearch + '&format=json&jsoncallback=?&media=photos&per_page=10',
        function(data){
        var item = data.photos.photo[ Math.floor( Math.random() * data.photos.photo.length ) ];
        var photoURL = 'https://farm' + item.farm + '.staticflickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_b.jpg';
        $('html').css('background','url(' + photoURL + ') no-repeat center center fixed');
        $('html').css('background-size','cover');
        }) 
    };

    //set Celsius temperature
    $(s.cTarget).text(Math.round(data.main.temp - 273.15) + '°C');
    $(s.cminTarget).text(Math.round(data.main.temp_min - 273.15) + '°C');
    $(s.cmaxTarget).text(Math.round(data.main.temp_max - 273.15) + '°C');

    //set Fahrenheit temperature
    $(s.fTarget).text(Math.round(((data.main.temp - 273.15) * 1.8) + 32) + '°F');
    $(s.fminTarget).text(Math.round(((data.main.temp_min - 273.15) * 1.8) + 32) + '°F');
    $(s.fmaxTarget).text(Math.round(((data.main.temp_min - 273.15) * 1.8) + 32) + '°F');

    //More Info
    $(s.descriptionTarget).text(data.weather[0].description);
    $(s.weatherMainTarget).text(data.weather[0].main);
    $(s.lonTarget).text(data.coord.lon);
    $(s.latTarget).text(data.coord.lat);
    $(s.placeTarget).text(data.name + ', ' + data.sys.country);
    $(s.windSpeedTarget).text(Math.round(data.wind.speed) + ' Mps');
    $(s.humidityTarget).text(data.main.humidity + '%');
    $(s.pressureTarget).text(data.main.pressure + 'hPa');
    $(s.sunriseTarget).text(formatTime(data.sys.sunrise) + ' AM');
    $(s.sunsetTarget).text(formatTime(data.sys.sunset) + ' PM');
    
	//set default icon and custom icon
    var defaultIconFileName = data.weather[0].icon;
    $(s.oriIconTarget).attr('src', '//openweathermap.org/img/w/' + defaultIconFileName + '.png');
    $(s.customIconTarget).addClass('customIcon-' + defaultIconFileName);

    //add class to element owfontTarget & bgImageTarget | to be used with css file.
    if(defaultIconFileName.indexOf('d') != -1) {
    $(s.owfontTarget).addClass('owf owf-' + data.weather[0].id + '-d');
    $(s.bgImageTarget).addClass('bgImage-' + data.weather[0].id + '-d');   
    } else if(defaultIconFileName.indexOf('n') != -1) {
    $(s.owfontTarget).addClass('owf owf-' + data.weather[0].id + '-n'); 
    $(s.bgImageTarget).addClass('bgImage-' + data.weather[0].id + '-n');
    } else {
    $(s.owfontTarget).addClass('owf owf-' + data.weather[0].id);
    $(s.bgImageTarget).addClass('bgImage-' + data.weather[0].id);
    };

    //run success callback
    s.success.call(this);
  },

  error: function(jqXHR, textStatus, errorThrown) {
         //run error callback
         s.error.call(this, textStatus);
  }

 });//ajax
    
}//fn

})(jQuery);
