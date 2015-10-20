
require 'json'

file_path = '/Users/kojima37/Documents/map/Hokkaido/hokkaido.json'
data = open(file_path) do |io|
  JSON.load(io)
end

puts data['features'][1]['properties']



features = data['features']

map_hash = Hash.new()


features.each do |f|
  prop = f['properties']
  k=prop['N03_007']
  v={}
  if not map_hash.has_key?(k)
    v = {'001':prop['N03_001'],
         '002':prop['N03_002'],
         '003':prop['N03_003'],
         '004':prop['N03_004']
    }

    map_hash[k]=v
  end
end

File.open('/Users/kojima37/Documents/map/Hokkaido/hokkaido_name_map.json',"w") do |io|
  p io.puts JSON.pretty_generate(map_hash)
end

#{"N03_001"=>"北海道", "N03_002"=>"空知総合振興局", "N03_003"=>nil, "N03_004"=>"芦別市", "N03_007"=>"01216"}
#{"N03_001"=>"北海道", "N03_002"=>"上川総合振興局", "N03_003"=>nil, "N03_004"=>"旭川市", "N03_007"=>"01204"}
#{"N03_001"=>"北海道", "N03_002"=>"空知総合振興局", "N03_003"=>nil, "N03_004"=>"芦別市", "N03_007"=>"01216"}

# "features": [
# { "type": "Feature", "properties": { "N03_001": "北海道", "N03_002": "上川総合振興局", "N03_003": null,
# "N03_004": "旭川市", "N03_007": "01204" }, "geometry": { "type": "Polygon", "