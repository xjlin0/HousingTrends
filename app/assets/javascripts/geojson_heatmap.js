(function(){
	var map, pointarray, heatmap, toggleHeatmap, boundary;
	var data_set_one = [],
			data_set_two = [],
			data_set_three = [],
			store_markers = [],
			places = [],
			markers = [];
	var styles = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#000000"},{"visibility":"on"},{"gamma":0.01}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"gamma":0.01}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#ffffff"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"invert_lightness":true},{"color":"#808080"},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"invert_lightness":true},{"saturation":-100},{"gamma":9.99}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#39009a"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"gamma":0.01},{"invert_lightness":true}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"gamma":0.01},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#39009a"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"invert_lightness":true},{"gamma":0.01},{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"gamma":0.01},{"weight":2.6}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#808080"},{"weight":0.4},{"lightness":45}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"visibility":"simplified"},{"color":"#808080"},{"lightness":26}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"invert_lightness":true},{"visibility":"on"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#808080"},{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#000000"},{"gamma":0.01}]},{"featureType":"transit.station.airport","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"gamma":0.01}]},{"featureType":"transit.station.airport","elementType":"labels.icon","stylers":[{"invert_lightness":true},{"visibility":"on"},{"gamma":9.99}]},{"featureType":"transit.station.bus","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"visibility":"simplified"},{"saturation":-100},{"gamma":0.01}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#bbddff"},{"visibility":"simplified"}]}];
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
		  store_markers.push(places);

		  if (places.length == 0) {
		    return;
		  }
		  for (var i = 0, marker; marker = markers[i]; i++) {
		    marker.setMap(null);
		  }

		  for(var j = 0; j < store_markers.length; j++){
			  // For each place, get the icon, place name, and location.
			  markers = [];
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
		console.log("reached");
		var pieceData, feature_lat, feature_lng;
	  debugger // load the requested variable from the census API
	  var xhr = new XMLHttpRequest();
	  // url should be server routes
//[boundary.getNorthEast().k, boundary.getNorthEast().D]
//[37.63537356402552, -122.16025047519531]
// Serverside: Store.in_bounds([sw_point,ne_point]).all #
// @bounds = Geokit::Bounds.new([32.91663,-96.982841], [32.96302,-96.919495])
//[boundary.getSouthWest().k, boundary.getSouthWest().D]
//[37.37390910883563, -122.56537132480469]

	// var url='/realestates/show?ne=['+[boundary.getNorthEast().k, boundary.getNorthEast().D].toString();
	// var url=url.concat(']&sw=['+[boundary.getSouthWest().k, boundary.getSouthWest().D]+']')
	  //xhr.open('GET', url);
	  
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
//[boundary.getNorthEast().k, boundary.getNorthEast().D]
//[37.63537356402552, -122.16025047519531]
	// var url='/realestates/show?ne=['+[boundary.getNorthEast().k, boundary.getNorthEast().D].toString();
	// marker's lat and lng return
	// var url=url.concat(']&sw=['+[boundary.getSouthWest().k, boundary.getSouthWest().D]+']')
// Serverside: Store.in_bounds([sw_point,ne_point]).all #
// @bounds = Geokit::Bounds.new([32.91663,-96.982841], [32.96302,-96.919495])
//[boundary.getSouthWest().k, boundary.getSouthWest().D]
//[37.37390910883563, -122.56537132480469]
	var userInputStreet = function(){
		var lat, lng;
		if(places.length > 0){
			lng = places[0].geometry.location.D;
			lat = places[0].geometry.location.k;
			return lat, lng;
		}
	}

	document.getElementById('heatmap-canvas').addEventListener("click", userInputStreet, false);

})();