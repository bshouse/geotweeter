#geoapp.rb
require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mongo'
require 'json'

include Mongo

 mongo_client = MongoClient.new("localhost", 27017)
 db = mongo_client.db('csci')
 coll = db.collection('summary')

#Location of static pages
set :public_folder, File.dirname(__FILE__) + '/static'
set :port, 3000

#Default Page
get '/' do 
	send_file File.join(settings.public_folder, 'hotspots.html')
end

#Summary content from Database
get '/summary' do
	content_type :json
	if params[:location]
		loc = params[:location]
	else 
		loc = "World"
	end
	coll.find("name" => loc).to_a.first.to_json
end

#Static Pages
get '/:name' do
	send_file File.join(settings.public_folder, params[:name])
end



