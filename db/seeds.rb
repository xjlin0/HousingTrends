#Warning: Database seeding from the scratch will take one entire day !!!!!!
# require 'geocoder'  #geocoder will depend on Google API limit 100k/day
# require 'to_words' #in Gemfile (numbers_and_words gem causing json error, can bypass by requiring active_support/json) see https://github.com/kslazarev/numbers_and_words/issues/106
# WARNING: Normalic gem canNOT handle addresses like "850 Avenue H 94130" or 365V FULTON ST, san francisco, CA
#require 'geo_ruby/geojson'    # geo_ruby got support for GeoJSON and ESRI SHP files
#Geokit::Geocoders::GoogleGeocoder.api_key='your key'
include Geokit::Geocoders
def google_geocoder(address)
  puts "\n in google_geocoder method \n"
  sleep 35  #google map api limit, annonymous minimun should be 0.3
  p location = GoogleGeocoder.geocode(address)  #Google can handle strange address
  parsed_address = Normalic::Address.parse(location.street_address)
  parsed_address.zipcode = location.zip if parsed_address.zipcode.nil?
  p current_geocode = Opengeocoder.find_or_create_by(street_address: parsed_address.line1.chomp!('.'))
  current_geocode.update(lat: location.lat, lng: location.lng) if location.lat && location.lng
  current_geocode.update(zip: parsed_address.zipcode.to_i) if parsed_address.zipcode
  return current_geocode
end

def abrv_ordinal(parsed_address, original_address)
  #Check for ordinal  730 29TH ST (accessor) => Fourth Street (opengeocoder) sometimes there are "5700 03rd St."     # "431 M L KING JR WAY 94607" and street name in numbers, "5378 TASSAJARA RD 94588" can be improved by to_words  gem
  puts "\n in abrv_ordinal method \n"
  num_street = Chronic::Numerizer.numerize(parsed_address.street).to_i
  parsed_address.street = num_street.ordinalize if num_street > 0
  parsed_address.number = original_address.split("-").last.split.first.to_i if parsed_address.number.nil? && original_address.include?("-") # for cases of "365V FULTON ST, san francisco, CA 94123"
  parsed_address.street = "Martin Luther King Junior" if parsed_address.street.include?("M L King Jr") # M L KING JR WAY(accessor) ==>  Martin Luther King Junior Way (open geocoder)
  parsed_address.street = "John F Kennedy" if parsed_address.street.include?("John F Kennedy") #for JFK dr in SFC
  return Opengeocoder.where(street_address: parsed_address.line1.chomp!('.'), zip: parsed_address.zipcode)
end

def create_realestate(candidates, net_value, county, current_year_in_word)
  candidate = candidates.first  #Let's assume there's only one match
  puts "\nin create_realestate method\n"
  p realestate = Realestate.find_or_create_by(street_address: candidate.street_address)
  realestate.county = county
  updated_value = realestate.send(current_year_in_word) + net_value #some bldg have many units
  realestate.lat, realestate.lng = candidate.lat, candidate.lng if realestate.lat.nil?
  realestate.zip = candidate.zip unless candidate.zip.nil?
  p realestate.send( (current_year_in_word+'=').to_sym, updated_value )
  p realestate.save!
end

#####Start of the seeder program####

f = File.open('db/seeding.log', 'w')

##### Loading postal abbreviations of road names/types ####

abrvs_file, abrv = "db/USPSabbreviations.CSV", Hash.new
CSV.foreach(abrvs_file, headers: true ) do |road|
  abrv[ road["Name"] ] = road["Abbreviation"]
end
f.puts Time.now, " finished loading of postal abbreviations hash\n"

#### End of loading postal abbreviations of road names/types ######

#### Staring the block of reading open address data for off-line geocoding ####

coor_files = ['db/us-ca-alameda_county6.CSV','db/us-ca-san_francisco0.CSV']
coor_files.each do |coor_file|
  missed_oa = Array.new
  CSV.foreach(coor_file, headers: true ) do |address|
    (missed_oa << address; next) unless address["STREET"]  #some openaddresses records are empty
    p $., address  #for checking progress, printing row number
    (missed_oa << address; next) if address["STREET"] == 'Unknown'
    #roadname = address["STREET"].upcase.split  #county tax data is upcase
    #roadname[-1] = abrv[roadname.last] if abrv[roadname.last] #Assessment data addrees are abbriviated street names, so abbreviation conversion is required.
    #p address_str = address["NUMBER"] +" "+ roadname.join(" ")#+ " "+ address["POSTCODE"].split("-").first
    address_line = address["NUMBER"].to_i.to_s + " " + address["STREET"] #remove "A" from "1249A" Appleton Stree 94129
    address_line = address_line + " "+ address["POSTCODE"][0..4] if address["POSTCODE"]
    parsed_address = Normalic::Address.parse(address_line)
    parsed_address.street = address["STREET"].split.last if parsed_address.street.nil? #for cases of "850 Avenue H 94130" or 40 Vía Ferlinghetti San Francisco, CA 94133
    num_street = Chronic::Numerizer.numerize(parsed_address.street).to_i
    parsed_address.street = num_street.ordinalize if num_street > 0 #make all street name ordinalized number
    parsed_address.street = "M L King Jr" if parsed_address.street.include?("Martin Luther King Junior") # M L KING JR WAY(accessor) ==>  Martin Luther King Junior Way (open geocoder)
    #address_str = address_str + " "+ address["POSTCODE"][0..4] if address["POSTCODE"] #some open addresses don't have ZIP codes, around row 512000, should curate the empty records around mission blvds later. Some address come with 5+4 zip codes
    #(missed_oa << address; next) if parsed_address.type.nil? #will kill "1 Embarcadero Center, San Francisco, CA 94111"
    (missed_oa << address; next) if parsed_address.number.nil? #capture unrecognized street numbers
    p current_geocode = Opengeocoder.find_or_create_by(street_address: parsed_address.line1.chomp!('.'))
    current_geocode.update_attributes(lat: address["LAT"].to_f, lng: address["LON"].to_f) if address["LAT"] && address["LON"]
    current_geocode.update_attributes(zip: parsed_address.zipcode.to_i) if parsed_address.zipcode
  end
  f.puts Time.now, " finished seeding of #{coor_file}, missed addresss: " + missed_oa.to_s + "\n"
  f.puts " finished seeding of #{coor_file}, the count of missed addresss: " + missed_oa.length.to_s + "\n"
end

##### End of reading open address data for off-line geocoding ######

##### Staring the block of parsing Alameda tax data with coordinates ####

counter, missed_tx, g_counts, county = 12, Array.new, 0, "Alameda County"  #Alameda's data starting from 2012
csv_files = Dir.entries('./db/').select {|f| f.match /csv\z/} #find all tax csv files under db/ entries('./db') case sensitively
csv_files.each do |csv_file|
  #p current_year_in_word = counter.to_words#.constantize  #!!!!!!check this one
  CSV.foreach('./db/'+csv_file, headers: true ) do |row|
    next if !row["Total Net Value"]  #why can't use unless?
    next if !row["Situs Street Number"]
    next if !row["Situs Street Name"]
    net_value = row["Total Net Value"].tr("$","").to_i  #this take care of "$" problems if exist
    next if net_value < 1   #some tax records don't have st# or net value
    p address = row["Situs Street Number"] + " " + row["Situs Street Name"] + " " + row["Situs Zip"]  #be aware of some record of open address may not have zip!!!!
    p $., address  # printing out row number for processing monitoring
    p parsed_address = Normalic::Address.parse(address)
    candidates = Opengeocoder.where(street_address: parsed_address.line1.chomp!('.'), zip: parsed_address.zipcode)
    # if candidates.empty?  #Check for ordinal  730 29TH ST (accessor) => Fourth Street (opengeocoder)  sometimes there are "5700 03rd St."
    candidates =  abrv_ordinal(parsed_address, address) if candidates.empty?
    p "\n line 107 \n"
    (g_counts += 1; candidates = [ google_geocoder(address) ] ) if candidates.empty?

    (missed_tx << address; p $., address, "address not found"; sleep 3; next) if candidates.empty?
    create_realestate(candidates, net_value, county, counter.to_words)
  end
  f.puts Time.now, " finished parsing the file: #{csv_file}. missed record count: #{missed_tx.length}, missed address:" + missed_tx.to_s + "\n"
  f.puts " Totally #{g_counts} of records is geocoded by Google\n"
  counter += 1
end

##### End of Alameda County data processing

##### Block of parsing SF tax data with coordinates ####

counter, missed_tx, g_counts, county = 8, Array.new, 0, "San Francisco County"  #San Francisco's data starting from 2008
p csv_files = Dir.entries('./db/').select {|f| f.match /sfc\z/} #find all tax csv files under db/ entries('./db') case sensitively
csv_files.each do |csv_file|
  p current_year_value = counter.to_words#.constantize  #!!!!!!check this one
  CSV.foreach('./db/'+csv_file, headers: true ) do |row|
    next if !row["Situs"]
    next if !row[" Taxable Value "]
    next if !row[" Zip "]
    net_value = row[" Taxable Value "].tr("$","").to_i  #this take care of "$" problems
    next if net_value < 1   #some tax records don't have st# or net value
    p address = row["Situs"] + " " + row[" Zip "][0..4]  #be aware of some record of open address may not have zip!!!!
    p $., address  # printing out row number for processing monitoring
    p parsed_address = Normalic::Address.parse(address.split("-").last) #for cases of "853 - 859 NORTH POINT ST" #<Normalic::Address:0x007fd52f16b410 @number="853", @direction="N", @street="859", @type=nil, @unit=nil, @city=nil, @state=nil, @zipcode=nil, @intersection=false>
    p candidates = Opengeocoder.where(street_address: parsed_address.line1.chomp!('.'), zip: parsed_address.zipcode)
    candidates =  abrv_ordinal(parsed_address, address) if candidates.empty?
    p "\n line 131 \n"
    (g_counts += 1; candidates = [ google_geocoder(address) ] ) if candidates.empty?
    (missed_tx << address; p $., address, "address not found"; sleep 3; next) if candidates.empty?
    create_realestate(candidates, net_value, county)
  end
  f.puts Time.now, " finished parsing the file: #{csv_file}. missed record count: #{missed_tx.length}, missed address: " + missed_tx.to_s + "\n"
  f.puts " Totally #{g_counts} of records is geocoded by Google\n"
  counter += 1
end

##### End of parsing SF tax data with coordinates  ####

##### Beginning of linear regression data

Realestate.find_each do |realestate|
  price_hash = Hash.new #Alameda and SF county got different covarage in years
  #years = Realestate.county == "Alameda County" ? (12..14).to_a : (8..13).to_a
  years = (12..14).to_a
  years.each{ |yr| price_hash[ yr ] = realestate.send( yr.to_words ) if realestate.send( yr.to_words )  > 0 }
  if price_hash.length > 1
    time, price = price_hash.to_a.transpose.first.to_scale, price_hash.to_a.transpose.last.to_scale
    p regression_line = Statsample::Regression.simple( time, price )
    p realestate.update(slope: regression_line.b, r2: regression_line.r2)
  end
end
f.puts Time.now, " finished linear regression\n"

##### end of linear regression data

##### Beginning of trend score calculation
slope_std, r2_std, distance_std = 750, 0.8, 0.1
Realestate.find_each do |realestate|
  local_realestates = Realestate.within(distance_std, :origin => realestate)
  up = local_realestates.select{ |re| re.slope > slope_std && re.r2 > r2_std } #cannot use count, keep_if or delete_if methods in geokit-rails
  p score = up.length / local_realestates.length.to_f * 100
  realestate.update(trend: score)
end
f.puts Time.now, " finished trend score calculation\n"

##### end of trend score calculation

##### Beginning of the Avarage calculation

county_zips = ['db/ala.zips', 'db/sfc.zips']
county_zips.each do |file|
  CSV.read(file).inject([]){|a,c|a << c.first.to_i}.each do |zip_code|
    p current_zip_area = Average.find_or_create_by(zip: zip_code)
    attributes = (8..15).map(&:to_words) + ["r2", "slope", "trend"]
    attributes.each do |year|
      realestates = Realestate.where("zip = ? AND "+year+" > ?", zip_code, 0)
      current_zip_area.send(year+"=", realestates.average(year).to_i)
    end
    current_zip_area.save!
  end
end
f.puts Time.now, " finished avarage calculation\n"

##### End of the Avarage calculation
f.close
