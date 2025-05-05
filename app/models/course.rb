class Course < ApplicationRecord
  has_many_attached :files, dependent: :destroy
  has_one_attached :image, dependent: :destroy
  has_many :course_views, dependent: :destroy

  belongs_to :note
  belongs_to :user

  has_many :ratings, dependent: :destroy

  def likes_count
    ratings.where(rating_type: "like").count
  end

  def dislikes_count
    ratings.where(rating_type: "dislike").count
  end
end
