class CreateLanguages < ActiveRecord::Migration[7.0]
	def change
		create_table :languages do |t|
			t.text :name
			t.timestamps
		end
	end
end
