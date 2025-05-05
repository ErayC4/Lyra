class Rating < ApplicationRecord
  belongs_to :user
  belongs_to :course

  validates :rating_type, inclusion: { in: [ "like", "dislike" ] }
  validates :user_id, uniqueness: { scope: :course_id, message: "kann einen Course nur einmal bewerten" }
end
