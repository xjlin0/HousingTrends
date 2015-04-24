class HeatmapsController < ApplicationController
	def zillow
		render 'zillow'
	end
	
	require 'uri'

	# def proxy
	# 	address=Normalic::Address.parse(params[:address])#, don't forget to set zillow key in .env, and HTTParty gem and require 'uri' in rails configuration
	# 	normalized_address = address.number+" "+address.street+" "+address.type+"&citystatezip="+address.city+","+address.state
	# 	url 	  = 'http://www.zillow.com/webservice/GetSearchResults.htm'
	# 	url      += '?zws-id=' + ENV['ZILLOW_KEY'] + '&address=' + normalized_address.tr(' ', '+')
	# 	response  = HTTParty.get(url).parsed_response   #consider to test if response ok here
	# 	render json: response.to_json
	# end

end
