class TasksController < ApplicationController
  before_action :set_task, only: %i[ show edit update destroy ]

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
    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @task = Task.find(params[:id])
    end

  private

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
  def remove_time_entry
    @task = Task.find(params[:id])
    entry_index = params[:entry_index].to_i

    if remove_entry_at_index(@task, entry_index)
      redirect_to @task, notice: "Eintrag erfolgreich entfernt."
    else
      redirect_to @task, alert: "Eintrag konnte nicht entfernt werden."
    end
  end

  private

  def remove_entry_at_index(task, index)
    task.time.each do |key, values|
      if values.is_a?(Array) && values.size > index
        task.time[key].delete_at(index)
      end
    end
    task.save
  end

  def task_params
    params.require(:task).permit(:title, time: [ :repeat_on_day, :ending_time, :starting_time, :task_id ])
  end
end

# def create
#   existing_task = Task.find_by(title: task_params[:title])

#   if existing_task
#     new_time = task_params[:time].to_h
#     merged_time = existing_task.time.dup

#     # Merge der Zeitdaten
#     [ :starting_time, :ending_time, :repeat_on_day ].each do |key|
#       existing_values = Array(merged_time[key])
#       new_values = Array(new_time[key])
#       merged_time[key] = existing_values + new_values
#     end

#     # Behalte die vorhandene task_id bei
#     merged_time.delete(:task_id)

#     if existing_task.update(time: merged_time)
#       redirect_to existing_task, notice: "Task wurde erfolgreich gemerged."
#       nil
#     else
#       @task = Task.new(task_params)
#       @task.errors.add(:base, "Merge fehlgeschlagen: #{existing_task.errors.full_messages.join(', ')}")
#       render :new
#       nil
#     end
#   else
#     @task = Task.new(task_params)

#     respond_to do |format|
#       if @task.save
#         @task.update(time: @task.time.merge(task_id: @task.id))
#         format.html { redirect_to @task, notice: "Task wurde erfolgreich erstellt." }
#         format.json { render :show, status: :created, location: @task }
#       else
#         format.html { render :new, status: :unprocessable_entity }
#         format.json { render json: @task.errors, status: :unprocessable_entity }
#       end
#     end
#   end
# end
