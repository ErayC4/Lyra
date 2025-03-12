class RenameGenerationToChatInAis < ActiveRecord::Migration[8.0]
  def change
    rename_column :ais, :generation, :chat
  end
end
