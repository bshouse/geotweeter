#geoapp.rb
require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mongo'
require 'json'

include Mongo

configure do
    #Location of static pages
    config_file = File.read('package.json')
    configs = JSON.parse config_file
    set :public_folder, configs['config']['public_folder']
    set :host, configs['config']['host']
    set :port, configs['config']['port']
    #Location of Mongo DB
    mongo_url = configs['config']['db_url']
    mongo_client = Mongo::Connection.from_uri(mongo_url)
    set :db, mongo_client.db(File.basename(mongo_url))
    disable :raise_errors, :show_exceptions,:dump_errors,:logging
    #Static files are served before route matching
    enable :static
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
    puts "Sending summary: #{loc}"
    coll.find("name" => loc).to_a.first.to_json
end

error do
  'Following error occured: ' + env['sinatra.error'].message
end

not_found do
    'No route for request: ' + request.path
end


