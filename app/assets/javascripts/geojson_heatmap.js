(function(){
	var zpid, zillow_result, contentString;

	var zillow_api_call = function(address){
			$.ajax({
				url:'heatmaps/proxy',
				data:{address:address}
			}).done(function(serverData){
				$('.zillow_address').text(address);
				console.log('success');
				console.log(serverData);
				if(serverData.searchresults.response != undefined){
					zillow_result = serverData.searchresults.response.results.result;
					zpid = zillow_result.zpid;
					console.log(zpid);
					$('.zillow_chart').append('<img src="http://i.imgur.com/RTi0ps2.png"/>');
					$('.zillow_address').append('<div class="zillow_est">Zillow Estimate Amount: $<b>' + zillow_result.zestimate.amount.__content__ + '</b></div>');
					// How to find the marker's point from our database???
					//contentString = "<h3>"+address+"</h3>"+"<div class='real_est_value'>"+zillow_result.zestimate.amount.__content__+"</div>";
				}
			}).fail(function(err){
				$('.zillow_address').text(address);
				console.log('error');
			});
	};

	var map, pointarray, heatmap, toggleHeatmap, boundary;
	var minZoomLevel = 10;

    var year_data = {
            twelve: [],
            thirteen: [],
            fourteen: []
        },
        data_set_one = [],
        store_markers = [],
        places = [],
        markers = [];
    var styles = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2e5d4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}];
    var styledMap = new google.maps.StyledMapType(styles,
     {name: "Styled Map"});
    var mapSetup = function() {
        var mapOptions = {
            zoom: 17,
            center: new google.maps.LatLng(37.8044, -122.2708),
            //center: new google.maps.LatLng(37.5047558,-122.3628109),
            mapTypeControlOptions: {
                mapTypeId: [google.maps.MapTypeId.ROADMAP, 'map_style']
                //mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        };

        map = new google.maps.Map(document.getElementById('heatmap-canvas'),
            mapOptions);

        // Limit the zoom level
        google.maps.event.addListener(map, 'zoom_changed', function() {
            if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(37.8044, -122.2708),
            map: map,
            draggable:true,
            title:"Alameda Housing Trend"
        });

        google.maps.event.addListener(marker,'dragend',function(event) {
            // document.getElementById('lat').value = event.latLng.lat();
            // document.getElementById('lng').value = event.latLng.lng();
            console.dir(marker);
            console.log(marker.position.D + " " + marker.position.k);

            $.ajax({
                url:'heatmaps/nearby',
                data: {lon:marker.position.D, lat:marker.position.k}
            }).done(function(serverData){
                console.log('success');
                contentString = "<div>"+marker.position.k + "," + marker.position.D+"</div>"+"<div>2012 average: <b>$"+serverData.features[0].properties.twelve+"</b></div>"+"<div>2013 average: <b>$"+serverData.features[0].properties.thirteen+"</b></div>"+"<div>2014 average: <b>$"+serverData.features[0].properties.fourteen+"</b></div>";
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                infowindow.open(map,marker);
                console.log('callback complete');
            }).fail(function(error){
                console.log('failed');
            });

        });

        map.mapTypes.set('map_style', styledMap);

        map.setMapTypeId('map_style');

        var input = (document.getElementById('pac-input'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var searchBox = new google.maps.places.SearchBox((input));

        google.maps.event.addListener(searchBox, 'places_changed', function() {
            places = searchBox.getPlaces();

            if (store_markers.length === 2) {
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

            // for (var j = 0; j < 2; j++) {
                // For each place, get the icon, place name, and location.
                // markers = [];
                boundary = new google.maps.LatLngBounds();
                for (var i = 0, place; place = store_markers[0][i]; i++) {
                    var selected_address = place.formatted_address;
                    zillow_api_call(selected_address);

                    // contentString = "<h3>"+selected_address+"</h3>";

                    //    var infowindow = new google.maps.InfoWindow({
                    //        content: contentString
                    //    });

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

                    // need to fix bugs here
                    // google.maps.event.addListener(marker, 'click', function() {
                    //    infowindow.open(map,marker);
                    //  });

                    if (markers.length === 2) {
                        var temp = markers.shift();
                        temp.setMap(null);
                    }
                    markers.push(marker);

                    boundary.extend(place.geometry.location);
                }
            // }

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
            setTimeout(function() {
                heatmap.setMap(null);
            }, 5000);
        }

        /*
          Object {type: "FeatureCollection", features: Array[264]}
          features: Array[264]
          [0 … 99]
          0: Object
          geometry: Object
          coordinates: Array[2]
          0: -122.2833991
          1: 37.799489
          length: 2
          __proto__: Array[0]
          type: "Point"
          __proto__: Object
          properties: Object
          eight: 101
          eleven: 150
          fifteen: 0
          fourteen: 0
          nine: 110
          ten: 108
          thirteen: 175
          twelve: 134
          __proto__: Object
          type: "Feature"
        */

        var readingGeoJsonFile = function() {
            var feature_lat, feature_lng;
            var xhr = new XMLHttpRequest();
            var url = '/heatmaps/show?ne=' + boundary.getNorthEast().k + boundary.getNorthEast().D;
            url = url.concat('&sw=' + boundary.getSouthWest().k + ',' + boundary.getSouthWest().D);
            xhr.open('GET', url);
            // debugger
            //  xhr.open('GET', 'https://api.myjson.com/bins/3inn1');
            //  https://api.myjson.com/bins/531t5
            console.log(xhr.responseText)
                //xhr.open('GET', 'https://api.myjson.com/bins/531t5');
            xhr.onload = function() {
                for (prop in year_data) {
                    year_data[prop] = [];
                }
                var housingData = JSON.parse(xhr.responseText);
                housingData.features.forEach(function(feature) {
                    feature_lat = feature.geometry.coordinates[1];
                    feature_lng = feature.geometry.coordinates[0];
                    if (((feature_lat <= boundary.Da.j) && (feature_lat >= boundary.Da.k)) && ((feature_lng <= boundary.va.k) && (feature_lng >= boundary.va.j))) {
                        each_data_per_year = feature.properties;
                        year_data.twelve.push({
                            location: new google.maps.LatLng(feature_lat, feature_lng),
                            weight: each_data_per_year.twelve
                        });
                        year_data.thirteen.push({
                            location: new google.maps.LatLng(feature_lat, feature_lng),
                            weight: each_data_per_year.thirteen
                        });
                        year_data.fourteen.push({
                            location: new google.maps.LatLng(feature_lat, feature_lng),
                            weight: each_data_per_year.fourteen
                        });
                        // for(year in each_data_per_year){
                        //  for(prop in year_data){
                        //    if (year === prop){
                        //      year_data[year].push({location: new google.maps.LatLng(feature_lat,feature_lng), weight:each_data_per_year[year]});
                        //    }
                        //  }
                        // }
                    }
                });

                console.log(year_data);
                for (every_year in year_data) {
                    addHeatmapLayer(year_data[every_year]);
                }
            }
            xhr.send();
        }

        var reqGeoInfo = function(street) {
            var xhr = new XMLHttpRequest();
            //https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=API_KEY
            xhr.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA');
            xhr.onload = function() {
                var geoinfo = JSON.parse(xhr.responseText);
            }
            xhr.send();
        }

        document.getElementById('heatmap-canvas').addEventListener("click", readingGeoJsonFile, false);

        // var userInputStreet = function(){
        //  var lat, lng;
        //  if(places.length > 0){
        //    lng = places[0].geometry.location.D;
        //    lat = places[0].geometry.location.k;
        //    zillow_api_call(places[0].formatted_address);
        //    return lat, lng;
        //  }
        // }

    }

	google.maps.event.addDomListener(window, "load", mapSetup);
})();