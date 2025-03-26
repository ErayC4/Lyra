class AddTitleToAi < ActiveRecord::Migration[8.0]
  def change
    add_column :ais, :title, :string
  end
end
