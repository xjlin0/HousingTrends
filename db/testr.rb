require 'parallel'
require 'smarter_csv'
options = {chunk_size: 4, col_sep: ',', row_sep: "\n"}
k = SmarterCSV.process('./test.CSV', options)

def ac(array_openaddress)
  array_openaddress.each do |address|
    sleep rand (2..6)
    p address
  end
  puts "done mine"
end


programs = [:ac, :sc]

Parallel.map(k) do |one_job|
  ac(one_job)
end

puts "i am the last"


true
"1856 GREEN ST 94123"
#<Normalic::Address:0x007ff7eaa41750 @number="1856", @direction=nil, @street="Green", @type="St.", @unit=nil, @city="San Francisco", @state="CA", @zipcode="94123", @intersection=false>
#<ActiveRecord::Relation []>

 in abrv_ordinal method
#<ActiveRecord::Relation [#<Opengeocoder id: 182536, street_address: "1000 Pine St", lat: 37.7908413, lng: -122.4125137, zip: 94109, created_at: "2015-05-25 07:09:29", updated_at: "2015-05-25 08:50:08">]>

in create_realestate method
#<Realestate id: 51, street_address: "1000 Pine St", county: "San Francisco County", lat: 37.7908413, lng: -122.4125137, zip: 94109, eight: 1735000, nine: 0, ten: 0, eleven: 0, twelve: 0, thirteen: 0, fourteen: 0, fifteen: 0, distance: nil, r2: 0.0, slope: 0.0, trend: 0.0, created_at: "2015-05-25 16:34:40", updated_at: "2015-05-25 16:35:26">
1738500
true
"1000 PINE ST 140G 94109"
#<Normalic::Address:0x007ff7ea819040 @number="1000", @direction=nil, @street="Pine", @type="St.", @unit=nil, @city="San Francisco", @state="CA", @zipcode="94109", @intersection=false>
#<ActiveRecord::Relation [#<Opengeocoder id: 516430, street_address: "710 Powell St", lat: 37.7912984, lng: -122.4088144, zip: 94108, created_at: "2015-05-25 08:35:23", updated_at: "2015-05-25 08:35:23">]>

in create_realestate method
#<Realestate id: 54, street_address: "710 Powell St", county: "San Francisco County", lat: 37.7912984, lng: -122.4088144, zip: 94108, eight: 1952000, nine: 0, ten: 0, eleven: 0, twelve: 0, thirteen: 0, fourteen: 0, fifteen: 0, distance: nil, r2: 0.0, slope: 0.0, trend: 0.0, created_at: "2015-05-25 16:34: