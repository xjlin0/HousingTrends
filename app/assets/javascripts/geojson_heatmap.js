(function(){
	var map, pointarray, heatmap, toggleHeatmap, boundary;
	var data_set_one = [],
			data_set_two = [],
			data_set_three = [],
			markers = [];
	var mapSetup = function(){
		var mapOptions = {
		  zoom: 11,
		  // center: new google.maps.LatLng(37.7047558,-122.1628109),
		  center: new google.maps.LatLng(37.5047558,-122.3628109),
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById('heatmap-canvas'),
		    mapOptions);

		var input = (document.getElementById('pac-input'));
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		var searchBox = new google.maps.places.SearchBox((input));

		google.maps.event.addListener(searchBox, 'places_changed', function() {
		  var places = searchBox.getPlaces();

		  if (places.length == 0) {
		    return;
		  }
		  for (var i = 0, marker; marker = markers[i]; i++) {
		    marker.setMap(null);
		  }

		  // For each place, get the icon, place name, and location.
		  markers = [];
		  boundary = new google.maps.LatLngBounds();
		  for (var i = 0, place; place = places[i]; i++) {
		  	// image can be an URL
		    var image = {
		      url: place.icon,
		      size: new google.maps.Size(71, 71),
		      origin: new google.maps.Point(0, 0),
		      anchor: new google.maps.Point(17, 34),
		      scaledSize: new google.maps.Size(25, 25)
		    };

		    var contentString = 'testing';

		    var infowindow = new google.maps.InfoWindow({
		        content: contentString
		    });

		    // Create a marker for each place.
		    var marker = new google.maps.Marker({
		      map: map,
		      icon: image,
		      // title: place.name,
		      title: place.name,
		      position: place.geometry.location
		    });

		    google.maps.event.addListener(marker, 'click', function() {
		      infowindow.open(map,marker);
		    });

		    markers.push(marker);

		    boundary.extend(place.geometry.location);
		  }

		  map.fitBounds(boundary);
		});

		google.maps.event.addListener(map, 'bounds_changed', function() {
        boundary = map.getBounds();
        searchBox.setBounds(boundary);
    });
	}

	mapSetup();

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

	document.getElementById('heatmap-canvas').addEventListener("click", readingGeoJsonFile, false);

})();