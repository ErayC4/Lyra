class User < ApplicationRecord
  has_many :tasks, dependent: :destroy # Löscht Tasks, wenn der User gelöscht wird

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
