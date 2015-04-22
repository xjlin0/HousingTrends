class RealestatesController < ApplicationController

  #require 'to_words' Should I need this even add it in Gemfile?

  def show
    #This method should return geojson for broser to overlay the realestates data
    #It will receieve ajax get calls: Realestate.in_bounds([sw_point, ne_point]).all
    p "in RealestatesController line 5"
    p params # { sw: [37.70186970040842, -122.16973099925843], ne: [37.70764178721548, -122.15589080074159] }
    realestates_hash = { type: "FeatureCollection", features: Array.new }
    realestates = Realestate.in_bounds([params[:sw], params[:ne]).all #double check if all is needed
    realestates.each do |realestate|
      value_year, years = Hash.new, (8..15).map(&:to_words)  #2008 ~ 2015 data
      years.each{|yr| value_year[yr.to_sym] = realestate.send(yr) if realestate.send(yr) > 0 }
      realestates_hash[:features] << { type: "Feature", geometry: { type: "Point", coordinates: [realestate.lng, realestate.lat] }, properties: value_year }
    end
    format.json {  render json: realestates_hash }
  end
end

# GeoJSON format
# {
#     "type": "FeatureCollection",
#     "features": [
#       {
#         "type": "Feature",
#         "geometry": {
#             "type": "Point",
#             "coordinates": [-122.2833991, 37.799489]
#         },
#         "properties": {
#             "weight": 245
#         }
#       },
#       {
#         "type": "Feature",
#         "geometry": {
#             "type": "Point",
#             "coordinates": [-122.2827154, 37.8005557]
#         },
#         "properties": {
#             "weight": 659
#         }
#       }
#     ]
# }