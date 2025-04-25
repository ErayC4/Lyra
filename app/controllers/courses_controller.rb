class CoursesController < ApplicationController
  before_action :set_course, only: %i[ show edit update destroy ]

  # GET /courses or /courses.json
  def index
    @courses = current_user.courses
  end

  # GET /courses/1 or /courses/1.json
  def show
    @course = Course.find(params[:id])
    # View-Erstellung hinzufügen, ähnlich wie in der read-Action
    if current_user
      unless CourseView.exists?(user: current_user, course: @course)
        @course.course_views.create(user: current_user)
      end
    else
      @course.course_views.create
    end
  end

  # GET /courses/new
  def new
    @course = Course.new
  end
  def read
    @course = Course.find(params[:id])
    # Weitere Logik für den Leseansicht

    render :read
  end
  # GET /courses/1/edit
  def edit
  end

  # POST /courses or /courses.json
  def create
    @course = current_user.courses.new(course_params)

    respond_to do |format|
      if @course.save
        format.html { redirect_to @course, notice: "Course was successfully created." }
        format.json { render :show, status: :created, location: @course }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @course.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /courses/1 or /courses/1.json
  def update
    respond_to do |format|
      if @course.update(course_params)
        format.html { redirect_to @course, notice: "Course was successfully updated." }
        format.json { render :show, status: :ok, location: @course }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @course.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /courses/1 or /courses/1.json
  def destroy
    @course.destroy!

    respond_to do |format|
      format.html { redirect_to courses_path, status: :see_other, notice: "Course was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_course
      @course = Course.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def course_params
      params.require(:course).permit(:title, :image, :likes, :dislikes, :description, :note_id, { files: [] })
    end
end
