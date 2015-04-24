class CreateHeatmaps < ActiveRecord::Migration
  def change
    create_table :heatmaps do |t|

      t.timestamps null: false
    end
  end
end
