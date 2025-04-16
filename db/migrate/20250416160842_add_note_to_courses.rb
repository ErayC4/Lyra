class AddNoteToCourses < ActiveRecord::Migration[8.0]
  def change
    add_reference :courses, :note, null: false, foreign_key: true
  end
end
