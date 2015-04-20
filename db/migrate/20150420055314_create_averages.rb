class CreateAverages < ActiveRecord::Migration
  def change
    create_table :averages do |t|
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
