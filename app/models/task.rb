# app/models/task.rb
class Task < ApplicationRecord
  store :time, accessors: [ :repeat_on_day, :ending_time, :starting_time, :task_id ], coder: JSON
end
