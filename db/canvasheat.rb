require 'to_words'
#require 'normalic'
require 'csv'
require 'json'
##### Block of reading postal abbreviations of road names ####
abrvs_file, abrv = "USPSabbreviations.CSV", Hash.new
CSV.foreach(abrvs_file, headers: true ) do |road|
  abrv[ road["Name"] ] = road["Abbreviation"]
end
puts "finished loading of postal abbreviations hash"
##### End of reading postal abbreviations of road names ######

##### Block of reading open address data for off-line geocoding ####
coor_file, coor, missed_oa = "us-ca-alameda_county6.CSV", Hash.new, 0
CSV.foreach(coor_file, headers: true ) do |address|
  (missed_oa += 1; next) unless address["STREET"]  #some openaddresses records are empty
  p $.  #for checking progress, printing row number
    roadname = address["STREET"].upcase.split  #county tax data is upcase
  roadname[-1] = abrv[roadname.last] if abrv[roadname.last] #abbriviate the street name
  p address_str = address["NUMBER"] +" "+ roadname.join(" ")#+ " "+ address["POSTCODE"].split("-").first
  address_str = address_str + " "+ address["POSTCODE"].split("-").first if address["POSTCODE"] #some open addresses don't have ZIP codes, around row 512000, should curate the empty records around mission blvds later. Some address come with 5+4 zip codes
  p coor[ address_str ] = [ address["LAT"], address["LON"] ]
end  #{lat: a.first.latitude, lng:a.first.longitude, count: 10}
puts "finished loading of coordinates hash, the count of missed coordinates: " + missed_oa.to_s
##### End of reading open address data for off-line geocoding ######

# require 'geocoder'  #geocoder will depend on Google API limit 100k/day

##### Block of parsing tax data with coordinates ####
counter = 12
csv_files = Dir.entries('.').select {|f| f.match /csv\z/} #find all tax csv files under db/ entries('./db') case sensitively
content = Array.new #temporary testing, no looping
last_address, missed_tx = String.new, 0 #for checking multiple units under one address
csv_files.each do |csv_file|
  p filename = counter.to_words
  File.open(filename+".js", 'w') do |f|
    f.puts "var "+ filename +" = ["
    CSV.foreach(csv_file, headers: true ) do |row|

      next if !row["Total Net Value"]
      next if !row["Situs Street Number"]
      next if !row["Situs Street Name"]
      net_value = row["Total Net Value"].tr("$","").to_i
      next if net_value < 1   #some tax records don't have st# or net value
      p $.
      #p row
        p address = row["Situs Street Number"] + " " + row["Situs Street Name"] + " " + row["Situs Zip"]  #be aware of some record of open address don't have zip!!!!
      (missed_tx += 1; p $., address, "address not found"; next) unless coor[address]
      # "431 M L KING JR WAY 94607" and street name in numbers, "5378 TASSAJARA RD 94588" can be improved by to_words  gem  (numbers_and_words gem causing json error)
      p bldg_coordinates = coor[address]

      if address == last_address
        puts "same unit........................", content
        #puts content[:weight], content[:weight].type
        content[-1] += net_value
      else
        #p content[:weight], content[:weight].class unless content.empty?
        content[-1] = (content[-1]**0.5).to_i  unless content.empty? #maybe log can used
        f.puts content.to_s+","  unless content.empty? #quatation marks can't be used in javascript
        #content = {lat: bldg_coordinates.first, lng: bldg_coordinates.last, weight: net_value}
        p content = [bldg_coordinates.first.to_f, bldg_coordinates.last.to_f, net_value.to_i]
      end  #{lat: 50.75, lng:-1.55, count: 1}
      last_address = address
    end
	content[-1] = (content[-1]**0.5).to_i
    f.puts content.to_s + "];"
    puts "finished parsing the file: #{csv_file}. missed record count " + missed_tx.to_s
  end #{|f| f.write("var data="+content.to_json+";") }
  counter += 1
end
##### End of parsing tax data with coordinates ####
