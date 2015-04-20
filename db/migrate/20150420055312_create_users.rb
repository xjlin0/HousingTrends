class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.string :email, format: { with: /\A[^@]+@[^@]+\z/ }, uniqueness: {case_sensitive: false}
      t.string :password_digest
      t.text :spots, array:true, default: []

      t.timestamps null: false
    end
    add_index :users, :email
  end
end
