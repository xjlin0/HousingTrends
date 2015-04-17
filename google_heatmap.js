(function(){
	var map, pointarray, heatmap, toggleHeatmap;
	var mapSetup = function(){
		var mapOptions = {
		  zoom: 12,
		  center: new google.maps.LatLng(37.7846334, -122.3974137),
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
	  setTimeout(function(){
	  	heatmap.setMap(null);
	  }, 1000);
	}

	var test_array = function(i){
		var data_weight = [1,25,50];
		return [{location: new google.maps.LatLng(37.7846334,-122.3974137), weight: data_weight[i]}]
	}

	for (var i = 0; i < 3; i++) {
	    setTimeout(function(x) { 
	    	return function() { 
	    		addHeatmapLayer(test_array(x)); 
	    	}; 
	    }(i), 1100*i);
	}
  
	document.getElementById("toggle_heatmap").addEventListener("click", function(){
		heatmap.setMap(heatmap.getMap() ? null : map);
	});

})();


