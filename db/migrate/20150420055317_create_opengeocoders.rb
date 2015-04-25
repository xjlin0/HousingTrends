class CreateOpengeocoders < ActiveRecord::Migration
  def change
    create_table :opengeocoders do |t|
      t.string :street_address
      t.float :lat
      t.float :lng
      t.integer :zip

      t.timestamps null: false
    end
  end
end
