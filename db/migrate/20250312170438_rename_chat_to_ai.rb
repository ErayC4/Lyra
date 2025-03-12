class RenameChatToAi < ActiveRecord::Migration[8.0]
  def change
    rename_table :chats, :ais
  end
end
