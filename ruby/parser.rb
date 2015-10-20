
require 'csv'
require 'json'

file_path = '/Users/kojima37/Documents/map/Hokkaido/hokkaidoData.csv'
#headers, *scores = CSV.read(file_path)

table = CSV.table(file_path)
header = table.headers
#puts header[0], header[2], header[3], header[4]
units = []
table.each do |row|

    #population = row[3].gsub(/[\s,]/ ,'')
    #puts population
    unit = { header[0] => row[0],
             header[1] => row[1],
             header[2] => row[2],
             header[3] => row[3].round(2)}
    units.push(unit)
end

File.open('/Users/kojima37/Documents/map/Hokkaido/hokkaido_population_delta_v2.json',"w") do |io|
  p io.puts JSON.pretty_generate(units)
end