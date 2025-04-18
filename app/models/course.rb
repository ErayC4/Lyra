class Course < ApplicationRecord
  has_many_attached :files, dependent: :destroy
  has_one_attached :image, dependent: :destroy
  belongs_to :note
  belongs_to :user
end
