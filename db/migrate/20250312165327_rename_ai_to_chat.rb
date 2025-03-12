class RenameAiToChat < ActiveRecord::Migration[8.0]
  def change
    rename_table :ais, :chats
  end
end
