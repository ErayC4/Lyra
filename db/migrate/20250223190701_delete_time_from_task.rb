class DeleteTimeFromTask < ActiveRecord::Migration[8.0]
  def change
    remove_column :tasks, :time, :json
  end
end
