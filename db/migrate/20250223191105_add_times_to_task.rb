class AddTimesToTask < ActiveRecord::Migration[8.0]
  def change
    add_column :tasks, :starting_time, :string
    add_column :tasks, :ending_time, :string
    add_column :tasks, :repeat_on_day, :string
  end
end
