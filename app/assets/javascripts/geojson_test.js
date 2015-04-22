(function(){
	var map, pointarray, heatmap, toggleHeatmap;
	var data_set_one = [],
			data_set_two = [],
			data_set_three = [];
	var mapSetup = function(){
		var mapOptions = {
		  zoom: 11,
		  center: new google.maps.LatLng(37.7047558,-122.1628109),
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById('heatmap-canvas'),
		    mapOptions);
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
		var pieceData;
	  // load the requested variable from the census API
	  var xhr = new XMLHttpRequest();
	  xhr.open('GET', 'https://api.myjson.com/bins/4lcdx');
	  xhr.onload = function() {
	    var housingData = JSON.parse(xhr.responseText);
	    housingData.features.forEach(function(feature){
	    	pieceData = {location: new google.maps.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]), weight:feature.properties.weight};
	    	data_set_one.push(pieceData);
	    });  
	    addHeatmapLayer(data_set_one);
	  }
	  xhr.send();

	}

	readingGeoJsonFile();	
})();