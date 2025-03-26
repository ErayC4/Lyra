class RenameChatToGeneration < ActiveRecord::Migration[8.0]
  def change
    rename_column :chats, :chat, :generation
  end
end
