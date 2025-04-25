class RatingsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_course

  def like
    handle_rating("like")
    redirect_to @course
  end

  def dislike
    handle_rating("dislike")
    redirect_to @course
  end

  private

  def set_course
    # Ändere hier: Verwende params[:id] statt params[:course_id]
    @course = Course.find(params[:id])
  end

  def handle_rating(rating_type)
    # Suche nach einer existierenden Bewertung
    rating = current_user.ratings.find_by(course: @course)

    if rating
      if rating.rating_type == rating_type
        # Wenn der User die gleiche Bewertung nochmal klickt, entferne sie
        rating.destroy
      else
        # Wenn der User die andere Bewertung klickt, ändere die bestehende
        rating.update(rating_type: rating_type)
      end
    else
      # Neue Bewertung erstellen
      current_user.ratings.create(course: @course, rating_type: rating_type)
    end
  end
end
