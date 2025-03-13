class AddUserToAis < ActiveRecord::Migration[8.0]
  def change
    add_reference :ais, :user, null: false, foreign_key: true
  end
end
