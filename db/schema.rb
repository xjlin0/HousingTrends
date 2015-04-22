# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150420055319) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "averages", force: :cascade do |t|
    t.integer  "zip"
    t.integer  "eight",      default: 100
    t.integer  "nine",       default: 100
    t.integer  "ten",        default: 100
    t.integer  "eleven",     default: 100
    t.integer  "twelve",     default: 100
    t.integer  "thirteen",   default: 100
    t.integer  "fourteen",   default: 100
    t.integer  "fifteen",    default: 100
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "opengeocoders", force: :cascade do |t|
    t.string   "street_address"
    t.string   "lat"
    t.string   "lng"
    t.integer  "zip"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
  end

  create_table "realestates", force: :cascade do |t|
    t.string   "street_address"
    t.string   "lat"
    t.string   "lng"
    t.integer  "zip"
    t.integer  "eight",          default: 0
    t.integer  "nine",           default: 0
    t.integer  "ten",            default: 0
    t.integer  "eleven",         default: 0
    t.integer  "twelve",         default: 0
    t.integer  "thirteen",       default: 0
    t.integer  "fourteen",       default: 0
    t.integer  "fifteen",        default: 0
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "realestates", ["lat"], name: "index_realestates_on_lat", using: :btree
  add_index "realestates", ["lng"], name: "index_realestates_on_lng", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.string   "email"
    t.string   "password_digest"
    t.text     "spots",           default: [],              array: true
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree

end
