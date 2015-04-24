(function(){
	var zpid;
	var zillow_api_call = function(address){
			$.ajax({
				url:'/heatmaps/proxy',
				data:{address:address}
			}).done(function(serverData){
				console.log('success');
				console.log(serverData);
				if(serverData.searchresults.response != undefined){
					zpid = serverData.searchresults.response.results.result.zpid;
					console.log(zpid);
				}
			}).fail(function(err){
				console.log('error');
			});
	};

	var map, pointarray, heatmap, toggleHeatmap, boundary;
	var data_set_one = [],
			store_markers = [],
			places = [],
			markers = [];
	var styles = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}];
	var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

	var mapSetup = function(){
		var mapOptions = {
		  zoom: 11,
		  // center: new google.maps.LatLng(37.7047558,-122.1628109),
		  center: new google.maps.LatLng(37.5047558,-122.3628109),
		  mapTypeControlOptions: {
		  	mapTypeId: [google.maps.MapTypeId.ROADMAP, 'map_style']
			}
		};

		map = new google.maps.Map(document.getElementById('heatmap-canvas'),
		    mapOptions);
		
		map.mapTypes.set('map_style', styledMap);
 		
 		map.setMapTypeId('map_style');

		var input = (document.getElementById('pac-input'));
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		var searchBox = new google.maps.places.SearchBox((input));

		google.maps.event.addListener(searchBox, 'places_changed', function() {
		  places = searchBox.getPlaces();
		  if(store_markers.length === 2){
		  	store_markers.shift();
		  }
		  store_markers.push(places);
		  console.log('counts ' + store_markers.length);

		  // if (places.length == 0) {
		  //   return;
		  // }
		  // for (var i = 0, marker; marker = markers[i]; i++) {
		  //   marker.setMap(null);
		  // }

		  for(var j = 0; j < 2; j++){
			  // For each place, get the icon, place name, and location.
			  // markers = [];
			  boundary = new google.maps.LatLngBounds();
			  for (var i = 0, place; place = store_markers[j][i]; i++) {
			  	// image can be an URL
			    var image = {
			      url: place.icon,
			      size: new google.maps.Size(71, 71),
			      origin: new google.maps.Point(0, 0),
			      anchor: new google.maps.Point(17, 34),
			      scaledSize: new google.maps.Size(25, 25)
			    };

			    // Create a marker for each place.
			    var marker = new google.maps.Marker({
			      map: map,
			      icon: image,
			      // title: place.name,
			      title: place.name,
			      position: place.geometry.location
			    });

			    if(markers.length === 2){
			    	var temp = markers.shift();
			    	temp.setMap(null);
			    }
			    markers.push(marker);

			    boundary.extend(place.geometry.location);
			  }
		  }

		  map.fitBounds(boundary);
		});

		google.maps.event.addListener(map, 'bounds_changed', function() {
        boundary = map.getBounds();
        searchBox.setBounds(boundary);
    });

    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ];

    var addHeatmapLayer = function(house_pricing_array) {
    	pointArray = new google.maps.MVCArray(house_pricing_array);
      heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointArray
      });
      heatmap.setMap(map);
      heatmap.set('gradient', gradient);
      heatmap.set('radius', 20);
      heatmap.set('opacity', 0.8);
      // setTimeout(function(){
      // 	heatmap.setMap(null);
      // }, 2000);
    }

    var readingGeoJsonFile = function(){
    	console.log("reached");
    	var pieceData, feature_lat, feature_lng;
      // load the requested variable from the census API
      var xhr = new XMLHttpRequest();

      xhr.open('GET', 'https://api.myjson.com/bins/4lcdx');
      xhr.onload = function() {
        var housingData = JSON.parse(xhr.responseText);
        housingData.features.forEach(function(feature){
        	feature_lat = feature.geometry.coordinates[1];
        	feature_lng = feature.geometry.coordinates[0];
        	if ((( feature_lat<= boundary.Da.j) && (feature_lat >= boundary.Da.k)) && ( (feature_lng <= boundary.va.k) && (feature_lng >= boundary.va.j))){
        		pieceData = {location: new google.maps.LatLng(feature_lat,feature_lng), weight:feature.properties.weight};
    	    	data_set_one.push(pieceData);
        	}
        });  
        addHeatmapLayer(data_set_one);
      }
      xhr.send();

    }

    var reqGeoInfo = function(street){
    	var xhr = new XMLHttpRequest();
    	//https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=API_KEY
      xhr.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA');
      xhr.onload = function() {
        var geoinfo = JSON.parse(xhr.responseText);
      }
      xhr.send();
    }

    document.getElementById('heatmap-canvas').addEventListener("click", readingGeoJsonFile, false);
    

    var inputAddress = document.getElementById('pac-input');

    var userInputStreet = function(){
    	var lat, lng;
    	if(places.length > 0){
    		lng = places[0].geometry.location.D;
    		lat = places[0].geometry.location.k;
    		zillow_api_call(places[0].formatted_address);
    		return lat, lng;
    	}
    }

    document.getElementById('heatmap-canvas').addEventListener("click", userInputStreet, false);
	}

	google.maps.event.addDomListener(window, "load", mapSetup);


})();

