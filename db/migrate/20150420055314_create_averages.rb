class CreateAverages < ActiveRecord::Migration
  def change
    create_table :averages do |t|
      t.integer :zip
      t.integer :eight, default: 100
      t.integer :nine, default: 100
      t.integer :ten, default: 100
      t.integer :eleven, default: 100
      t.integer :twelve, default: 100
      t.integer :thirteen, default: 100
      t.integer :fourteen, default: 100
      t.integer :fifteen, default: 100

      t.timestamps null: false
    end
  end
end
