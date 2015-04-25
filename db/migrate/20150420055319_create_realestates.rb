class CreateRealestates < ActiveRecord::Migration
  def change
    create_table :realestates do |t|
      t.string :street_address
      t.float :lat
      t.float :lng
      t.integer :zip
      t.integer :eight, default: 0
      t.integer :nine, default: 0
      t.integer :ten, default: 0
      t.integer :eleven, default: 0
      t.integer :twelve, default: 0
      t.integer :thirteen, default: 0
      t.integer :fourteen, default: 0
      t.integer :fifteen, default: 0

      t.timestamps null: false
    end
      add_index :realestates, :lat
      add_index :realestates, :lng
  end
end
