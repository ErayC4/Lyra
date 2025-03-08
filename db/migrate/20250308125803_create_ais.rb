class CreateAis < ActiveRecord::Migration[8.0]
  def change
    create_table :ais do |t|
      t.json :generation

      t.timestamps
    end
  end
end
