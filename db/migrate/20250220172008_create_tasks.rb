class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title
      t.integer :user_id
      t.json :time

      t.timestamps
    end
  end
end
