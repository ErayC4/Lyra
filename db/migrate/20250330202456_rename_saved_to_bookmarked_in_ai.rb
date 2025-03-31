class RenameSavedToBookmarkedInAi < ActiveRecord::Migration[8.0]
  def change
    rename_column :ais, :saved, :bookmarked
  end
end
