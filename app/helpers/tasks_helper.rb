module TasksHelper
  def calculate_margin_to_baseline(baseline, start_time)
    return 0 if baseline.nil? || start_time.nil?
    start_time_part = start_time.split(":").map(&:to_i)
    hour = start_time_part[0]
    minutes = start_time_part[1]

    (hour * 60 + minutes) - (baseline * 60)
  end

  def calculate_height(start_time, end_time)
    ending_time_parts = end_time.split(":").map(&:to_i)
    starting_time_parts = start_time.split(":").map(&:to_i)

    ending_hours = ending_time_parts[0]
    ending_minutes = ending_time_parts[1]
    starting_hours = starting_time_parts[0]
    starting_minutes = starting_time_parts[1]

    time_length = (ending_hours * 60 + ending_minutes) - (starting_hours * 60 + starting_minutes)

    time_length.abs
  end

  def smallest_value_in_array(start_times)
    return 6 if start_times.empty?
    smallest_value = start_times[0]
    start_times.each do |i| 
        if i < smallest_value
          smallest_value = i
        end
    end
    smallest_value
  end
end