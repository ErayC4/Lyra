class Note < ApplicationRecord
  belongs_to :user
  has_many :courses
  has_many_attached :files, dependent: :destroy
end
