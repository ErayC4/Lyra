class CreateCourses < ActiveRecord::Migration[8.0]
  def change
    create_table :courses do |t|
      t.string :title
      t.integer :likes
      t.integer :dislikes
      t.text :description

      t.timestamps
    end
  end
end
