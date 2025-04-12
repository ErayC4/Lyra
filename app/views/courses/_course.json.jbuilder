json.extract! course, :id, :title, :likes, :dislikes, :description, :created_at, :updated_at
json.url course_url(course, format: :json)
