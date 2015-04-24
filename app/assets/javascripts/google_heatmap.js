(function(){
	var map, pointarray, heatmap, toggleHeatmap;
	var data_set_one = [],
			data_set_two = [],
			data_set_three = [];
	var mapSetup = function(){
		var mapOptions = {
		  zoom: 14,
		  center: new google.maps.LatLng(37.7047558,-122.1628109),
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById('heatmap-canvas'),
		    mapOptions);

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
			console.log(house_pricing_array[0]);
			pointArray = new google.maps.MVCArray(house_pricing_array);
		  heatmap = new google.maps.visualization.HeatmapLayer({
		    data: pointArray
		  });
		  heatmap.setMap(map);
		  heatmap.set('gradient', gradient);
		  heatmap.set('radius', 20);
		  heatmap.set('opacity', 0.8);
		  setTimeout(function(){
		  	heatmap.setMap(null);
		  }, 5000);
		}

			addHeatmapLayer(data_twelve);
			addHeatmapLayer(thirteen);
			addHeatmapLayer(fourteen);

	}

	// var test_array = function(){
	// 	// var counter = data_twelve.length;
	// 	// for(var j=0; j < counter; j++){
	// 	// 	data_set_one.push({location: new google.maps.LatLng(data_twelve[j].lat,data_twelve[j].lng), weight: (data_twelve[j].count/10000)});
	// 	// }
		

	// 	// setTimeout(function(){
	// 	// 	counter = data_thirteen.length;
	// 	// 	for(var j=0; j < counter; j++){
	// 	// 		data_set_two.push({location: new google.maps.LatLng(data_thirteen[j].lat,data_thirteen[j].lng), weight: (data_thirteen[j].count/10000)});
	// 	// 	}
	// 	// 	addHeatmapLayer(data_set_two);
	// 	// }, 2000);

	// 	// setTimeout(function(){
	// 	// 	counter = data_fourteen.length;
	// 	// 	for(var j=0; j < counter; j++){
	// 	// 		data_set_three.push({location: new google.maps.LatLng(data_fourteen[j].lat,data_fourteen[j].lng), weight: (data_fourteen[j].count/10000)});
	// 	// 	}
	// 	// 	addHeatmapLayer(data_set_three);
	// 	// },2000);
	// }

	// test_array();
	google.maps.event.addDomListener(window, "load", mapSetup);

})();