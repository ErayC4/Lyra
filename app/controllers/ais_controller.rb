class AisController < ApplicationController
  before_action :set_ai, only: %i[ show edit update destroy ]

  # GET /ais or /ais.json
  def index
    @ais = current_user.ais
  end

  # GET /ais/1 or /ais/1.json
  def show
    respond_to do |format|
      format.html # Renders the show.html.erb template
      format.json { render json: { id: @ai.id, chat: @ai.chat } }
    end
  end

  # GET /ais/new
  def new
    @ai = Ai.new
  end

  # GET /ais/1/edit
  def edit
  end

  # POST /ais or /ais.json
  def create
    @ai = current_user.ais.build(ai_params)

    if @ai.save
      render json: { id: @ai.id, chat: @ai.chat }, status: :created
    else
      render json: { errors: @ai.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /ais/1 or /ais/1.json
  def update
    respond_to do |format|
      if @ai.update(ai_params)
        format.html { redirect_to @ai, notice: "Ai was successfully updated." }
        format.json { render json: { id: @ai.id, chat: @ai.chat }, status: :ok }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: { errors: @ai.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /ais/1 or /ais/1.json
  def destroy
    @ai.destroy!

    respond_to do |format|
      format.html { redirect_to ais_path, status: :see_other, notice: "Ai was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_ai
      @ai = current_user.ais.find(params[:id])
      unless @ai
        respond_to do |format|
          format.html { redirect_to ais_path, notice: "Chat not found" }
          format.json { render json: { errors: [ "Chat not found" ] }, status: :not_found }
        end
      end
    end

    # Only allow a list of trusted parameters through.
    def ai_params
      # Erlaubt ein Array von Nachrichten in 'chat'
      params.require(:ai).permit(:title, chat: [ :role, :content ])
    end
end
