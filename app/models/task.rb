class Task < ApplicationRecord
  store :time, accessors: [ :repeat_on_day, :ending_time, :starting_time, :task_id ], coder: JSON

  def starting_time
    Array(self[:starting_time])
  end

  def ending_time
    Array(self[:ending_time])
  end

  def repeat_on_day
    Array(self[:repeat_on_day])
  end

  def task_id
    Array(self[:task_id])
  end
end
