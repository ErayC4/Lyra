class AddSavedToAi < ActiveRecord::Migration[8.0]
  def change
    add_column :ais, :saved, :boolean
  end
end
