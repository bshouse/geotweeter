#geoapp.rb
require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'sinatra/config_file'
require 'mongo'
require 'json'

include Mongo
config_file 'config.yml'

configure do
	#Location of static pages
	set :public_folder, settings.public_folder
	set :host, settings.host
	set :port, settings.port
	#Location of Mongo DB
	mongo_client = MongoClient.new(settings.db_host,settings.db_port)
 	set :db, mongo_client.db(settings.db_name)
 	disable :raise_errors, :show_exceptions,:dump_errors,:logging
end


#Default Page
get '/' do 
	send_file File.join(settings.public_folder, 'hotspots.html')
end

#Summary content from Database
get '/summary' do
	coll = settings.db.collection('summary')
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




