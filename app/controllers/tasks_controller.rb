class TasksController < ApplicationController
  before_action :set_task, only: %i[ show edit update destroy]

  # GET /tasks or /tasks.json
  def index
    @tasks = Task.all
  end

  # GET /tasks/1 or /tasks/1.json
  def show
  end

  # GET /tasks/new
  def new
    @task = Task.new
  end

  # GET /tasks/1/edit
  def edit
  end

  # POST /tasks or /tasks.json
  def create
    existing_task = Task.find_by(title: task_params[:title])

    if existing_task
      merge_time_data(existing_task, task_params[:time])
      if existing_task.save
        redirect_to existing_task, notice: "Task wurde erfolgreich zusammengeführt."
      else
        render :new
      end
    else
      @task = Task.new(task_params)
      if @task.save
        @task.update(time: @task.time.merge(task_id: [ @task.id ]))
        redirect_to @task, notice: "Task wurde erfolgreich erstellt."
      else
        render :new
      end
    end
  end
  def remove_time_entry
    @task = Task.find(params[:id])
    index_to_remove = params[:index].to_i

    return render json: { error: "Ungültiger Index" }, status: :unprocessable_entity if index_to_remove.negative?

    updated_time = @task.time.deep_dup

    # Iteriere durch `updated_time`, aber ignoriere `task_id`
    updated_time.each do |key, values|
      next if key == "task_id" # `task_id` bleibt unverändert

      if values.is_a?(Array) && index_to_remove < values.length
        values.delete_at(index_to_remove)
      end
    end

    # Überprüfen, ob alle Felder (außer `task_id`) leer sind
    if updated_time.except("task_id").values.all?(&:empty?)
      @task.destroy!
      respond_to do |format|
        format.html { redirect_to tasks_path, notice: "Task wurde gelöscht, da er leer war." }
        format.json { head :no_content }
      end
    else
      if @task.update(time: updated_time)
        respond_to do |format|
          format.html { redirect_to @task, notice: "Zeit-Eintrag entfernt." }
          format.json { render json: @task, status: :ok }
        end
      else
        render json: @task.errors, status: :unprocessable_entity
      end
    end
  end




  # PATCH/PUT /tasks/1 or /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params)
        format.html { redirect_to @task, notice: "Task was successfully updated." }
        format.json { render :show, status: :ok, location: @task }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1 or /tasks/1.json
  def destroy
    @task.destroy!

    respond_to do |format|
      format.html { redirect_to tasks_path, status: :see_other, notice: "Task was successfully destroyed." }
      format.json { head :no_content }
    end
  end


  private

  def set_task
    @task = Task.find(params[:id])
  end

  def merge_time_data(existing_task, new_time)
    merged_time = existing_task.time.dup

    [ :starting_time, :ending_time, :repeat_on_day, :task_id ].each do |key|
      current = Array(merged_time[key])
      new_value = new_time[key]
      current << new_value unless new_value.blank?
      merged_time[key] = current.compact
    end

    existing_task.time = merged_time
  end



  def task_params
    params.require(:task).permit(:title, time: [ :repeat_on_day, :ending_time, :starting_time, :task_id ])
  end
end
