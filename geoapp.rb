#geoapp.rb
require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mongo'
require 'json/ext'

include Mongo


get '/' do 
	'Hello from geotweeter!'
end
