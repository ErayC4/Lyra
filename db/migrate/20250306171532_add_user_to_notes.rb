class AddUserToNotes < ActiveRecord::Migration[8.0]
  def change
    add_column :notes, :user_id, :integer
    add_foreign_key :notes, :users
  end
end
