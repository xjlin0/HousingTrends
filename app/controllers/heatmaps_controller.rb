class HeatmapsController < ApplicationController
	def zillow
		render 'zillow'
	end
	
	require 'uri'

	def proxy
		zwsid = 'X1-ZWz1a9jqja8op7_1u0pu'
		address=Normalic::Address.parse(params[:address])#, don't forget to set zillow key in .env, and HTTParty gem and require 'uri' in rails configuration
		normalized_address = address.number+"+"+address.street+"+"+address.type+"&citystatezip="+address.city+","+address.state
		@print_address = address.number+" "+address.street+" "+address.type+" "+address.city+","+address.state
		p url 	  = "http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=#{zwsid}&address=#{normalized_address.sub(' ', '+')}"
		response  = HTTParty.get(url).parsed_response   #consider to test if response ok here
		render json: response.to_json
	end

end
