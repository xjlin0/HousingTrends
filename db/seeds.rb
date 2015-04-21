#Warning: Database seeding from the scratch will take one entire day !!!!!!
# require 'geocoder'  #geocoder will depend on Google API limit 100k/day
# require 'to_words' #in Gemfile (numbers_and_words gem causing json error)
# require 'normalic' #in Gemfile
require 'csv'
#require 'json' #rails come with json

##### Staring the block of reading postal abbreviations of road names ####
abrvs_file, abrv = "db/USPSabbreviations.CSV", Hash.new
CSV.foreach(abrvs_file, headers: true ) do |road|
  abrv[ road["Name"] ] = road["Abbreviation"]
end
puts "finished loading of postal abbreviations hash"
##### End of reading postal abbreviations of road names ######

##### Staring the block of reading open address data for off-line geocoding ####

coor_files, missed_oa = ['db/us-ca-alameda_county6.CSV','db/us-ca-san_francisco0.CSV'], 0
coor_files.each do |coor_file|
  CSV.foreach(coor_file, headers: true ) do |address|
    (missed_oa += 1; next) unless address["STREET"]  #some openaddresses records are empty
    p $.  #for checking progress, printing row number
      (missed_oa += 1; next) if address["STREET"] == 'Unknown'
    roadname = address["STREET"].upcase.split  #county tax data is upcase
    roadname[-1] = abrv[roadname.last] if abrv[roadname.last] #Assessment data addrees are abbriviated street names, so abbreviation conversion is required.
    p address_str = address["NUMBER"] +" "+ roadname.join(" ")#+ " "+ address["POSTCODE"].split("-").first
    address_str = address_str + " "+ address["POSTCODE"][0..4] if address["POSTCODE"] #some open addresses don't have ZIP codes, around row 512000, should curate the empty records around mission blvds later. Some address come with 5+4 zip codes

    current_geocode = Opengeocoder.find_or_create_by(street_address: address_str)

    current_geocode.update_attributes(lat: address["LAT"], lng: address["LON"]) if address["LAT"] && address["LON"]
    current_geocode.update_attributes(zip: address["POSTCODE"][0..4].to_i) if address["POSTCODE"]
  end
end
puts "finished seeding of alameda and SF county geocoder, the count of missed coordinates: " + missed_oa.to_s

##### End of reading open address data for off-line geocoding ######


##### Staring the block of parsing Alameda tax data with coordinates ####
counter, missed_tx = 12, 0  #Alameda's data starting from 2012
csv_files = Dir.entries('./db/').select {|f| f.match /csv\z/} #find all tax csv files under db/ entries('./db') case sensitively
csv_files.each do |csv_file|
  p current_year_value = counter.to_words#.constantize  #!!!!!!check this one
  CSV.foreach('./db/'+csv_file, headers: true ) do |row|
    next if !row["Total Net Value"]
    next if !row["Situs Street Number"]
    next if !row["Situs Street Name"]
    net_value = row["Total Net Value"].tr("$","").to_i  #this take care of "$" problems
    next if net_value < 1   #some tax records don't have st# or net value
    p $.  # printing out row number for processing monitoring
    p address = row["Situs Street Number"] + " " + row["Situs Street Name"] + " " + row["Situs Zip"]  #be aware of some record of open address may not have zip!!!!
    candidates = Opengeocoder.where(street_address: address)
    if candidates.empty?
      (missed_tx += 1; p $., address, "address not found"; next)
      #elsif
      # MLK, JFK abbreviations convertion or other geocoding processing goes here.
    end
    candidate = candidates.first  #Let's assume there's only one match
    # "431 M L KING JR WAY 94607" and street name in numbers, "5378 TASSAJARA RD 94588" can be improved by to_words  gem

    p geocoding_one = Realestate.find_or_create_by(street_address: candidate.street_address)
    updated_value = geocoding_one.send(current_year_value) + net_value #some bldg have many units
    p geocoding_one.send( (current_year_value+'=').to_sym, updated_value )
    p geocoding_one.save!
  end
  puts "finished parsing the file: #{csv_file}. missed record count " + missed_tx.to_s
  counter += 1
end
##### End of Alameda County data processing

##### Block of parsing SF tax data with coordinates ####

counter, missed_tx = 8, 0  #Alameda's data starting from 2012
p csv_files = Dir.entries('./db/').select {|f| f.match /sfc\z/} #find all tax csv files under db/ entries('./db') case sensitively
csv_files.each do |csv_file|
  p current_year_value = counter.to_words#.constantize  #!!!!!!check this one
  CSV.foreach('./db/'+csv_file, headers: true ) do |row|
    next if !row["Situs"]
    next if !row[" Taxable Value "]
    next if !row[" Zip "]
    net_value = row[" Taxable Value "].tr("$","").to_i  #this take care of "$" problems
    next if net_value < 1   #some tax records don't have st# or net value
    p $.  # printing out row number for processing monitoring
    p address = row["Situs"] + row[" Zip "]  #be aware of some record of open address may not have zip!!!!
    p candidates = Opengeocoder.where(street_address: address)
    if candidates.empty?
      (missed_tx += 1; p $., address, "address not found"; next)
      #elsif
      # MLK, JFK abbreviations convertion or other geocoding processing goes here.
    end
    candidate = candidates.first  #Let's assume there's only one match

    p geocoding_one = Realestate.find_or_create_by(street_address: candidate.street_address)
    updated_value = geocoding_one.send(current_year_value) + net_value #some bldg have many units
    p geocoding_one.send( (current_year_value+'=').to_sym, updated_value )
    p geocoding_one.save!
  end
  puts "finished parsing the file: #{csv_file}. missed record count " + missed_tx.to_s
  counter += 1
end
##### End of SF County data processing