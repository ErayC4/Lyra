class Ai < ApplicationRecord
  belongs_to :user, dependent: :destroy
end
