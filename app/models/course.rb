class Course < ApplicationRecord
  has_many_attached :files, dependent: :destroy
  has_one_attached :image, dependent: :destroy
  has_many :course_views
  belongs_to :note
  belongs_to :user
end
