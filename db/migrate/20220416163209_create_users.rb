class CreateUsers < ActiveRecord::Migration[7.0]
	def change
		create_table :users do |t|
			t.text :email, null: false
			t.text :password_digest, null: false
			t.text :first_name, null: false
			t.text :last_name, null: false
			t.text :image
			t.text :bio
			t.timestamps
		end
		add_index :users, :email, unique: true
	end
end
