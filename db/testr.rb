require 'parallel'
require 'smarter_csv'

def worker(array_of_hashes)
  ActiveRecord::Base.connection.reconnect!
  #data seeding
end

chunks = SmarterCSV.process('filename.CSV', chunk_size: 1000)

Parallel.map(chunks) do |chunk|
  worker(chunk)
end

# puts "all finished!"

# programs = [:ac, :sc]
# true
# "1856 GREEN ST 94123"
# #<Normalic::Address:0x007ff7eaa41750 @number="1856", @direction=nil, @street="Green", @type="St.", @unit=nil, @city="San Francisco", @state="CA", @zipcode="94123", @intersection=false>
# #<ActiveRecord::Relation []>

#  in abrv_ordinal method
# #<ActiveRecord::Relation [#<Opengeocoder id: 182536, street_address: "1000 Pine St", lat: 37.7908413, lng: -122.4125137, zip: 94109, created_at: "2015-05-25 07:09:29", updated_at: "2015-05-25 08:50:08">]>

# in create_realestate method
# #<Realestate id: 51, street_address: "1000 Pine St", county: "San Francisco County", lat: 37.7908413, lng: -122.4125137, zip: 94109, eight: 1735000, nine: 0, ten: 0, eleven: 0, twelve: 0, thirteen: 0, fourteen: 0, fifteen: 0, distance: nil, r2: 0.0, slope: 0.0, trend: 0.0, created_at: "2015-05-25 16:34:40", updated_at: "2015-05-25 16:35:26">
# 1738500
# true
# "1000 PINE ST 140G 94109"
# #<Normalic::Address:0x007ff7ea819040 @number="1000", @direction=nil, @street="Pine", @type="St.", @unit=nil, @city="San Francisco", @state="CA", @zipcode="94109", @intersection=false>
# #<ActiveRecord::Relation [#<Opengeocoder id: 516430, street_address: "710 Powell St", lat: 37.7912984, lng: -122.4088144, zip: 94108, created_at: "2015-05-25 08:35:23", updated_at: "2015-05-25 08:35:23">]>

# in create_realestate method
# #<Realestate id: 54, street_address: "710 Powell St", county: "San Francisco County", lat: 37.7912984, lng: -122.4088144, zip: 94108, eight: 1952000, nine: 0, ten: 0, eleven: 0, twelve: 0, thirteen: 0, fourteen: 0, fifteen: 0, distance: nil, r2: 0.0, slope: 0.0, trend: 0.0, created_at: "2015-05-25 16:34:


# ==============
# "2644 MYRTLE ST "
# #<Normalic::Address:0x007fdd3c8522a0 @number="2644", @direction=nil, @street="Myrtle", @type="St.", @unit=nil, @city="Oakland", @state="CA", @zipcode="94607", @intersection=false>

#  in abrv_ordinal method line 23
# "\n parsed address are now : "
# #<Normalic::Address:0x007fdd3c8522a0 @number="2644", @direction=nil, @street="Myrtle", @type="St.", @unit=nil, @city="Oakland", @state="CA", @zipcode="94607", @intersection=false>

#  in google_geocoder method line 9
# rescuing line 16:
# Geokit::Geocoders::GeocodeError
# 1
# rescuing line 16:
# Geokit::Geocoders::GeocodeError
# 2
# "2644 MYRTLE ST 94607"
# "address not found"
# rake aborted!
# Undumpable Exception -- #<TypeError: can't dup NilClass>

# Tasks: TOP => db:seed
# (See full trace by running task with --trace)