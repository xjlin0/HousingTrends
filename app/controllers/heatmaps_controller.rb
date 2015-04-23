class HeatmapsController < ApplicationController
	def zillow
		render 'zillow'
	end
	
	
require 'uri'
require 'httparty'
	
	def proxy
		#params[:address], don't forget to set zillow key in .env, and HTTParty gem and require 'uri' in rails configuration
		url 	  = 'http://www.zillow.com/webservice/GetSearchResults.htm'
		url      += '?zws-id=' + ENV['ZILLOW_KEY'] + '&address=' + URI::escape(params[:address])
		response  = HTTParty.get(url+).parsed_response   #consider to test if response ok here
		format.json{ render json: response  }   #or response.to_json
	end
end
