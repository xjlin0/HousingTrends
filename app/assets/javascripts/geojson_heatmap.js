(function(){
	var zpid, zillow_result, contentString;
    var search_geoinfo = new google.maps.LatLng(37.5869, -122.0258);

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
					$('.zillow_chart').append('<img src="http://i.imgur.com/NKru0SZ.png"/>');
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
	var minZoomLevel = 13;

    var year_data = {
            twelve: [],
            thirteen: [],
            fourteen: []
        },
        data_set_one = [],
        store_markers = [],
        places = [],
        markers = [];
    //var styles = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2e5d4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}]; // https://snazzymaps.com/style/1/pale-dawn
    var styles = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]; // https://snazzymaps.com/style/61/blue-essence
    //var styles = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":60}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"lightness":30}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ef8c25"},{"lightness":40}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#b6c54c"},{"lightness":40},{"saturation":-40}]},{}]; //https://snazzymaps.com/style/84/pastel-tones

    var styledMap = new google.maps.StyledMapType(styles,
     {name: "Styled Map"});
    var mapSetup = function() {
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(37.5869, -122.0258),
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
            if (map.getZoom() < minZoomLevel){
                map.setZoom(minZoomLevel);
            } 
        });

        var drop_marker = function(){
           var marker = new google.maps.Marker({
                position: search_geoinfo,
                map: map,
                draggable:true,
                title:"Alameda Housing Trend"
            });

            google.maps.event.addListener(marker,'dragend',function(event) {
                // document.getElementById('lat').value = event.latLng.lat();
                // document.getElementById('lng').value = event.latLng.lng();
                // if (infowindow) {
                //     infowindow.close();
                // }
                $.ajax({
                    url:'heatmaps/nearby',
                    data: {lon:marker.position.lng(), lat:marker.position.lat()}
                }).done(function(serverData){
                    var yearsWords = ["eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];  // are there to_words function in JS?
                    var years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
                    var contentString = "<div> The value of "+serverData.features[0].properties.street_address+"</div>";//+"<div>2012 average: <b>"+serverData.features[0].properties.twelve+"%</b></div>"+"<div>2013 average: <b>"+serverData.features[0].properties.thirteen+"%</b></div>"+"<div>2014 average:<b>"+serverData.features[0].properties.fourteen+"%</b></div>";
                    contentString = contentString.concat("<div>compared to the average of the</div><div>same zip code or itself:</div>")
                    for (var i = 0 ; i < years.length ; i++){
                        if (typeof serverData.features[0].properties[yearsWords[i]] === 'undefined'){ console.log('skip');
                        }else{
                            contentString = contentString.concat("<div>"+years[i]+" was: <b>"+serverData.features[0].properties[yearsWords[i]]+"%</b></div>")
                        }
                    } // end of looping all property values of the clicked object
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });   // Jack: probably better to use setContent() instead of renew one.
                    infowindow.open(map,marker);
                    console.log('callback complete');
                }).fail(function(error){
                    console.log('failed');
                });
            });
        }
        drop_marker();
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

                    var temp_marker = place.geometry.location;
                    search_geoinfo = new google.maps.LatLng(temp_marker.lat(), temp_marker.lng());
                    drop_marker();
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
            'rgba(255, 255, 255, 0)',
            '#FCEDEF',
            '#FADBDE',
            '#F7C9CE',
            '#F5B8BE',
            '#F2A6AD',
            '#F0949D',
            '#ED828D',
            '#EB707C',
            '#E85E6C',
            '#E64C5C',
            '#E33B4B',
            '#E0293B',
            '#D61F31'
        ];  // fourteen colors from http://colllor.com/e85d6b

        // var gradient = [
        //     'rgba(0, 255, 255, 0)',
        //     'rgba(0, 255, 255, 1)',
        //     'rgba(0, 191, 255, 1)',
        //     'rgba(0, 127, 255, 1)',
        //     'rgba(0, 63, 255, 1)',
        //     'rgba(0, 0, 255, 1)',
        //     'rgba(0, 0, 223, 1)',
        //     'rgba(0, 0, 191, 1)',
        //     'rgba(0, 0, 159, 1)',
        //     'rgba(0, 0, 127, 1)',
        //     'rgba(63, 0, 91, 1)',
        //     'rgba(127, 0, 63, 1)',
        //     'rgba(191, 0, 31, 1)',
        //     'rgba(255, 0, 0, 1)'
        // ]; // original google color

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
            var feature_lat, feature_lng,
                xhr = new XMLHttpRequest(),
                northEast = boundary.getNorthEast().toString(),
                northEast_array = northEast.substring(1).replace(')','').split(','),
                northEast_k = northEast_array[0],
                northEast_D = northEast_array[1],
                southWest = boundary.getSouthWest().toString(),
                southWest_array = southWest.substring(1).replace(')','').split(','),
                southWest_k = southWest_array[0],
                southWest_D = southWest_array[1];
            var url = '/heatmaps/show?ne=' + northEast_k + ',' + northEast_D;
            url = url.concat('&sw=' + southWest_k + ',' + southWest_D);
            xhr.open('GET', url);
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
                    // if (((feature_lat <= boundary.Da.j) && (feature_lat >= boundary.Da.k)) && ((feature_lng <= boundary.va.k) && (feature_lng >= boundary.va.j))) {
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
                    // }
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

    // var map_with_heat = function(){
    //     mapSetup();
    //     readingGeoJsonFile();
    // }

	google.maps.event.addDomListener(window, "load", mapSetup);
})();