module ApplicationHelper
  def format_date(timestamp)
    if timestamp.today?
      "Heute"
    elsif timestamp.to_date == Date.yesterday
      "Gestern"
    elsif Time.now - timestamp < 1.hour
      "Gerade eben"
    else
      timestamp.strftime("%d. %B")
    end
  end
end
