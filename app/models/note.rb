class Note < ApplicationRecord
  belongs_to :user
  has_many :courses, dependent: :destroy
  has_many_attached :files, dependent: :destroy
end
