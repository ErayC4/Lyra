class User < ApplicationRecord
  has_many :tasks, dependent: :destroy # Löscht Tasks, wenn der User gelöscht wird
  has_many :notes, dependent: :destroy
  has_many :ais, dependent: :destroy
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
