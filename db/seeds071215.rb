#Warning: Database seeding from the scratch will take one entire day !!!!!!
# require 'geocoder'  #geocoder will depend on Google API limit 100k/day
# require 'to_words' #in Gemfile (numbers_and_words gem causing json error, can bypass by requiring active_support/json) see https://github.com/kslazarev/numbers_and_words/issues/106
# WARNING: Normalic gem canNOT handle addresses like "850 Avenue H 94130" or 365V FULTON ST, san francisco, CA, and (if parsed_address.type.nil?) will kill "1 Embarcadero Center, San Francisco, CA 94111"
#require 'geo_ruby/geojson'    # geo_ruby got support for GeoJSON and ESRI SHP files
include Geokit::Geocoders
#Geokit::Geocoders::GoogleGeocoder.api_key=ENV['JEREMY_API_KEY']
def google_geocoder(address)
  puts "\n in google_geocoder method line 9 trying" + address
  times = 0
  sleep (1..10).to_a.map{|o|o*0.9}.sample  #google map api limit 100k/day, minimun should be more than 0.2*number of process ~1.7
  ActiveRecord::Base.connection.reconnect!
  location = GoogleGeocoder.new
  begin
    p location = GoogleGeocoder.geocode(address)


    # p location = GoogleGeocoder.geocode(address)  #Google can handle strange address
    # (sleep rand(1..30); location = GoogleGeocoder.geocode(address)) unless location.success
    # return [] unless location.success
    parsed_address = Normalic::Address.parse(location.street_address)
    parsed_address.zipcode = location.zip if parsed_address.zipcode.nil?
    p current_geocode = Opengeocoder.find_or_create_by(street_address: parsed_address.line1.chomp!('.'))
    current_geocode.update(lat: location.lat, lng: location.lng) if location.lat && location.lng
    current_geocode.update(zip: parsed_address.zipcode.to_i) if parsed_address.zipcode
    return [current_geocode]

  rescue Geokit::Geocoders::GeocodeError
    puts "rescuing line 17: ", $!.message
    sleep (30..100).to_a.map{|o|o*0.1}.sample
    p times += 1
    if times < 2
      retry
    else
      return []
    end
  end

end

def abrv_ordinal(parsed_address, original_address)
  #Check for ordinal  730 29TH ST (accessor) => Fourth Street (opengeocoder) sometimes there are "5700 03rd St."     # "431 M L KING JR WAY 94607" and street name in numbers, "5378 TASSAJARA RD 94588" can be improved by to_words  gem
  puts "\n in abrv_ordinal method line 40 \n"
  num_street = Chronic::Numerizer.numerize(parsed_address.street).to_i
  parsed_address.street = num_street.ordinalize if num_street > 0
  parsed_address.number = original_address.split("-").last.split.first.to_i if parsed_address.number.nil? && original_address.include?("-") # for cases of "365V FULTON ST, san francisco, CA 94123"
  parsed_address.street = "Martin Luther King Junior" if parsed_address.street.include?("M L King Jr") # M L KING JR WAY(accessor) ==>  Martin Luther King Junior Way (open geocoder)
  parsed_address.street = "John F Kennedy" if parsed_address.street.include?("John F Kennedy") #for JFK dr in SFC
  p "\n parsed address are now : ", parsed_address
  return Opengeocoder.where(street_address: parsed_address.line1.chomp!('.'), zip: parsed_address.zipcode)
end

def create_realestate(candidates, net_value, county, current_year_in_word)
  candidate = candidates.first  #Let's assume there's only one match
  puts "\nin create_realestate method line 52\n"
  p realestate = Realestate.find_or_create_by(street_address: candidate.street_address)
  realestate.county = county
  updated_value = realestate.send(current_year_in_word) + net_value #some bldg have many units
  realestate.lat, realestate.lng = candidate.lat, candidate.lng if realestate.lat.nil?
  realestate.zip = candidate.zip unless candidate.zip.nil?
  p realestate.send( (current_year_in_word+'=').to_sym, updated_value )
  puts "finishing saving of Realestate object"
  p realestate.save!
end

def opengeocoder_worker(address_in_array_of_hashes)
  ActiveRecord::Base.connection.reconnect!
  missed_oa = Array.new
  address_in_array_of_hashes.each do |address|
    (missed_oa << address; next) unless address[:street]
    p address[:street]
    (missed_oa << address; next) if address[:street] == 'Unknown'
    address_line = address[:number].to_i.to_s + " " + address[:street]
    address_line = address_line + " "+ address[:postcode].to_s[0..4] if address[:postcode]
    parsed_address = Normalic::Address.parse(address_line)
    parsed_address.street = address[:street].split.last if parsed_address.street.nil? #for cases of "850 Avenue H 94130" or 40 Vía Ferlinghetti San Francisco, CA 94133
    num_street = Chronic::Numerizer.numerize(parsed_address.street).to_i
    parsed_address.street = num_street.ordinalize if num_street > 0 #make all street name ordinalized number
    parsed_address.street = "M L King Jr" if parsed_address.street.include?("Martin Luther King Junior") # M L KING JR WAY(accessor) ==>  Martin Luther King Junior Way (open geocoder)
    (missed_oa << address; next) if parsed_address.number.nil? #capture unrecognized street numbers
    p current_geocode = Opengeocoder.find_or_create_by(street_address: parsed_address.line1.chomp!('.'))
    current_geocode.update_attributes(lat: address[:lat].to_f, lng: address[:lon].to_f) if address[:lat] && address[:lon]
    current_geocode.update_attributes(zip: parsed_address.zipcode.to_i) if parsed_address.zipcode
  end
  return missed_oa
end

#### Staring the block of reading open address data for off-line geocoding ####
# def opengeocoder(coor_file)
#   f = File.open(coor_file+'.log', 'w')
#   missed_oa = Array.new
#   CSV.foreach(coor_file, headers: true ) do |address|
#     (missed_oa << address; next) unless address["STREET"]  #some openaddresses records are empty
#     p $., address  #for checking progress, printing row number
#     (missed_oa << address; next) if address["STREET"] == 'Unknown'
#     address_line = address["NUMBER"].to_i.to_s + " " + address["STREET"] #remove "A" from "1249A" Appleton Stree 94129
#     address_line = address_line + " "+ address["POSTCODE"][0..4] if address["POSTCODE"]
#     parsed_address = Normalic::Address.parse(address_line)
#     parsed_address.street = address["STREET"].split.last if parsed_address.street.nil? #for cases of "850 Avenue H 94130" or 40 Vía Ferlinghetti San Francisco, CA 94133
#     num_street = Chronic::Numerizer.numerize(parsed_address.street).to_i
#     parsed_address.street = num_street.ordinalize if num_street > 0 #make all street name ordinalized number
#     parsed_address.street = "M L King Jr" if parsed_address.street.include?("Martin Luther King Junior") # M L KING JR WAY(accessor) ==>  Martin Luther King Junior Way (open geocoder)
#     (missed_oa << address; next) if parsed_address.number.nil? #capture unrecognized street numbers
#     p current_geocode = Opengeocoder.find_or_create_by(street_address: parsed_address.line1.chomp!('.'))
#     current_geocode.update_attributes(lat: address["LAT"].to_f, lng: address["LON"].to_f) if address["LAT"] && address["LON"]
#     current_geocode.update_attributes(zip: parsed_address.zipcode.to_i) if parsed_address.zipcode
#   end
#   f.write Time.now.utc.to_s + " finished seeding of #{coor_file}, missed addresss: " + missed_oa.to_s + "\n"
#   f.write " finished seeding of #{coor_file}, the count of missed addresss: " + missed_oa.length.to_s + "\n"
# end
##### End of reading open address data for off-line geocoding ######
##### Staring the block of parsing Alameda tax data with coordinates ####
def acdata_worker(address_in_array_of_hashes, counter)
  ActiveRecord::Base.connection.reconnect!
  missed_tx, g_counts, county = Array.new, Array.new, "Alameda County"  #Alameda's data starting from 2012
  address_in_array_of_hashes.each do |row|
    #f = File.open(coderdata+'.re', 'w')
    begin
      #csv_files = Dir.entries('./db/').select {|f| f.match /csv\z/} #find all tax csv files under db/ entries('./db') case sensitively
      #csv_files.each do |csv_file|
      #p current_year_in_word = counter.to_words#.constantize  #!!!!!!check this one
      next if row[:total_net_value].length * row[:situs_street_number].length * row[:situs_street_name].length == 0
      # next if !row[:total_net_value]  #why can't use unless? because empty string !!"" #=>true
      # next if !row[:situs_street_number]
      # next if !row[:situs_street_name]
      net_value = row[:total_net_value].tr("$","").to_i  #this take care of "$" problems if exist
      next if net_value < 1   #some tax records don't have st# or net value
      p address = row[:situs_street_number] + " " + row[:situs_street_name] + " "
      address = address + row[:situs_zip][0..4] if row[:situs_zip].length > 4 #be aware of some record of open address may not have zip!!!!
      p parsed_address = Normalic::Address.parse(address)
      candidates = Opengeocoder.where(street_address: parsed_address.line1.chomp!('.'), zip: parsed_address.zipcode)
      # if candidates.empty?  #Check for ordinal  730 29TH ST (accessor) => Fourth Street (opengeocoder)  sometimes there are "5700 03rd St."
      candidates =  abrv_ordinal(parsed_address, address) if candidates.empty?

      (g_counts << address; candidates = google_geocoder(address) ) if candidates.empty?
      #puts "AC worker line 132"
      (missed_tx << address; p address, "address not found"; next) if candidates.empty?
      puts "AC worker line 135"
      create_realestate(candidates, net_value, county, counter.to_words)


    rescue Exception => e
      p e.backtrace
    end

  end
  return missed_tx, g_counts
end
# f.write Time.now.utc.to_s + " finished parsing the file: #{csv_file}. missed record count: #{missed_tx.length}, missed address:" + missed_tx.to_s + "\n"
# f.write " Totally #{g_counts.length} of records is geocoded by Google and here is their address\n" + g_counts.to_s
# counter += 1

##### End of Alameda County data processing
##### Block of parsing SF tax data with coordinates ####

def sfcdata_worker(address_in_array_of_hashes, counter)
  ActiveRecord::Base.connection.reconnect!
  missed_tx, g_counts, county = Array.new, Array.new, "San Francisco County"
  address_in_array_of_hashes.each do |row|

    #p csv_files = Dir.entries('./db/').select {|f| f.match /sfc\z/} #find all tax csv files under db/ entries('./db') case sensitively
    # csv_files.each do |csv_file|
    #   p current_year_value = counter.to_words#.constantize  #!!!!!!check this one
    #   CSV.foreach('./db/'+csv_file, headers: true ) do |row|
    next if row[:situs].length * row[:taxable_value].length == 0
    # next if !row[:taxable_value]
    # next if !row[:zip]
    net_value = row[:taxable_value].tr("$","").to_i  #this take care of "$" problems
    next if net_value < 1   #some tax records don't have st# or net value
    p address = row[:situs] + " "
    address = address + row[:zip][0..4] if row[:zip].length > 4 #be aware of some record of open address may not have zip!!!!
    #p $., address  # printing out row number for processing monitoring
    p parsed_address = Normalic::Address.parse(address.split("-").last) #for cases of "853 - 859 NORTH POINT ST" #<Normalic::Address:0x007fd52f16b410 @number="853", @direction="N", @street="859", @type=nil, @unit=nil, @city=nil, @state=nil, @zipcode=nil, @intersection=false>
    p candidates = Opengeocoder.where(street_address: parsed_address.line1.chomp!('.'), zip: parsed_address.zipcode)
    candidates =  abrv_ordinal(parsed_address, address) if candidates.empty?
    puts "\n line 167 \n"
    (g_counts << address; candidates = google_geocoder(address) ) if candidates.empty?
    (missed_tx << address; p address, "address not found"; next) if candidates.empty?
    create_realestate(candidates, net_value, county, counter.to_words)
  end
  return missed_tx, g_counts
end
# f.write Time.now.utc.to_s + " finished parsing the file: #{csv_file}. missed record count: #{missed_tx.length}, missed address: " + missed_tx.to_s + "\n"
# f.write " Totally #{g_counts.length} of records is geocoded by Google and here is their address\n" + g_counts.to_s
# counter += 1
##### End of parsing SF tax data with coordinates  ####

#####Start of the seeder program####

##### Loading postal abbreviations of road names/types ####
abrvs_file, abrv = "db/USPSabbreviations.CSV", Hash.new
puts "Loading postal abbreviations, wait......"
CSV.foreach(abrvs_file, headers: true ) do |road|
  abrv[ road["Name"] ] = road["Abbreviation"]
end
File.open('db/abrvs_file.log', 'w').write Time.now.utc.to_s + " finished loading of postal abbreviations hash\n"
#### End of loading postal abbreviations of road names/types ######
#### Start parallel data processing of both counties (opengeocoder and tax)
#052515
options = {chunk_size: 1000, col_sep: ',', row_sep: "\n", verbose: true, remove_empty_values: false, remove_zero_values: false, convert_values_to_numeric: false}
# coor_files, missed_ot = ['db/us-ca-alameda_county6.CSV','db/us-ca-san_francisco0.CSV'], Array.new
# coor_files.each do |coor_file|
#   csv = SmarterCSV.process(coor_file, options)
#   Parallel.map(csv) do |chunk|
#     missed_ot += opengeocoder_worker(chunk)
#   end
# end
# File.open('db/geocoder_generator.log', 'w').write Time.now.utc.to_s + " Finished generating of opengeocoder\n" +  " , in both counties. missed geocoader count: #{missed_ot.length}, and here are the address:\n\n" + missed_ot.to_s

#AC #052515
csv_files, missed_at, missed_gt, counter = Dir.entries('./db/').select {|f| f.match /csv\z/}, Array.new, Array.new, 12 #find all tax csv files under db/ entries('./db') case sensitively
csv_files.each do |csv_file|
  puts "Starting slicing csv files #{csv_file}, hold on......"
  csv = SmarterCSV.process('./db/'+csv_file, options)
  Parallel.map(csv) do |chunk|
    tempm, tempg = acdata_worker(chunk, counter)
    missed_at += tempm
    missed_gt += tempg
  end
  counter += 1
end
File.open('db/alameda_county.log', 'w').write Time.now.utc.to_s + " Finished generating of realestates in Alameda County\n" +  " Missed address count: #{missed_at.length}, and here are the address:\n\n" + missed_at.to_s + "Google helped #{missed_gt.length}, and here are the address:\n" + missed_gt.to_s

#SFC 052515

csv_files, missed_at, missed_gt, counter = Dir.entries('./db/').select {|f| f.match /sfc\z/}, Array.new, Array.new, 8
csv_files.each do |csv_file|
  puts "Starting slicing csv files #{csv_file}, hold on......"
  csv = SmarterCSV.process('./db/'+csv_file, options)
  Parallel.map(csv) do |chunk|
    tempm, tempg = sfcdata_worker(chunk, counter)
    missed_at += tempm
    missed_gt += tempg
  end
  counter += 1
end
File.open('db/sf_county.log', 'w').write Time.now.utc.to_s + " Finished generating of realestates in SF County\n" +  " Missed address count: #{missed_at.length}, and here are the address:\n\n" + missed_at.to_s + "Google helped #{missed_gt.length}, and here are the address:\n" + missed_gt.to_s

#### End paralleldata processing of both counties (opengeocoder and tax)
##### Beginning of linear regression data
#052515
Realestate.find_each do |realestate|
  price_hash = Hash.new #Alameda and SF county got different covarage in years
  years = Realestate.county == "Alameda County" ? (12..14).to_a : (8..13).to_a
  years.each{ |yr| price_hash[ yr ] = realestate.send( yr.to_words ) if realestate.send( yr.to_words )  > 0 }
  if price_hash.length > 1
    time, price = price_hash.to_a.transpose.first.to_scale, price_hash.to_a.transpose.last.to_scale
    p regression_line = Statsample::Regression.simple( time, price )
    p realestate.update(slope: regression_line.b, r2: regression_line.r2)
  end
end
File.open('db/realestates_regression.log', 'w').write Time.now.utc.to_s + " finished linear regression\n"

##### end of linear regression data

##### Beginning of trend score calculation
#052515
slope_std, r2_std, distance_std = 750, 0.8, 0.1
Realestate.find_each do |realestate|
  local_realestates = Realestate.within(distance_std, :origin => realestate)
  up = local_realestates.select{ |re| re.slope > slope_std && re.r2 > r2_std } #cannot use count, keep_if or delete_if methods in geokit-rails
  p score = up.length / local_realestates.length.to_f * 100
  realestate.update(trend: score)
end
f.write Time.now.utc.to_s + " finished trend score calculation\n"

##### end of trend score calculation

##### Beginning of the Avarage calculation
#052515
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
File.open('db/realestates_average.log', 'w').write Time.now.utc.to_s + " finished avarage calculation\n"

##### End of the Avarage calculation
