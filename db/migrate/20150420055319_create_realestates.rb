class CreateRealestates < ActiveRecord::Migration
  def change
    create_table :realestates do |t|
      t.string :street_address
      t.string :lat
      t.string :lng
      t.integer :zip
      t.integer :eight
      t.integer :nine
      t.integer :ten
      t.integer :eleven
      t.integer :twelve
      t.integer :thirteen
      t.integer :fourteen
      t.integer :fifteen

      t.timestamps null: false
    end
  end
end
