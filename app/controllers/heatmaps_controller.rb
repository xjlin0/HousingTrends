class HeatmapsController < ApplicationController
	def zillow
		render 'zillow'
	end

	require 'uri'

	def proxy
		zwsid = ENV['ZWSID']
		address=Normalic::Address.parse(params[:address])#, don't forget to set zillow key in .env, and HTTParty gem and require 'uri' in rails configuration
		normalized_address = address.number+"+"+address.street+"+"+address.type+"&citystatezip="+address.city+","+address.state
		@print_address = address.number+" "+address.street+" "+address.type+" "+address.city+","+address.state
		p url 	  = "http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=#{zwsid}&address=#{normalized_address.sub(' ', '+')}"
		response  = HTTParty.get(url).parsed_response   #consider to test if response ok here
		render json: response.to_json
	end

	def show

# // Jack's testing for getting boundaries from Google map current view
# // google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
# //     var bounds = this.getBounds();
# //     var ne = bounds.getNorthEast();
# //     var sw = bounds.getSouthWest();
# //     console.log('Here is SW:', sw.toString(), 'here is NE:', ne.toString())
# // }); //((37.70186970040842, -122.16973099925843), (37.70764178721548, -122.15589080074159))
# // Using ajax to tell serverside: Realestate.in_bounds([sw_point, ne_point]).all
# // http://stackoverflow.com/questions/2832636/google-maps-api-v3-getbounds-is-undefined
# // google.maps.event.addListenerOnce(gmap, "bounds_changed", function(){
# //   loadMyMarkers();
# //   google.maps.event.addListener(gmap, "idle", loadMyMarkers);  //for IE8
# // });
#http://localhost:3000/heatmaps/show?sw=37.70186970040842,-122.16973099925843&ne=37.70764178721548,-122.15589080074159
		p "heatmap controller line 18"
		p params
		p swa = params[:sw].split(',').map(&:to_f)
		p nea = params[:ne].split(',').map(&:to_f)
		p "line 37"
		p sw = Geokit::LatLng.new(swa.first, swa.last)
		p ne = Geokit::LatLng.new(nea.first, nea.last)
		p local_realestates = Realestate.in_bounds([sw, ne])
		#p1=Geokit::LatLng.new(37.70186970040842, -122.16973099925843)
		#p2=Geokit::LatLng.new(37.70764178721548, -122.15589080074159)
		#Geokit::Bounds.new does NOT work
		#Realestate.in_bounds([p1, p2])  #141 objects showing!
		realestates_hash = { type: "FeatureCollection", features: Array.new }
		local_realestates.each do |realestate|
      value_year, years = Hash.new, (8..15).map(&:to_words)  #2008 ~ 2015 data
      years.each{|yr| value_year[yr.to_sym] = realestate.send(yr) if realestate.send(yr) > 0 }
      realestates_hash[:features] << { type: "Feature", geometry: { type: "Point", coordinates: [realestate.lng, realestate.lat] }, properties: value_year }
    end
    render json: realestates_hash

	end
end
