class Course < ApplicationRecord
  has_many_attached :files, dependent: :destroy
  has_one_attached :image, dependent: :destroy
end
