class AisController < ApplicationController
  before_action :set_ai, only: %i[ show edit update destroy ]

  # GET /ais or /ais.json
  def index
    @ais = Ai.all
  end

  # GET /ais/1 or /ais/1.json
  def show
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
    @ai = Ai.new(ai_params)

    if @ai.save
      render json: { message: "Chat erfolgreich gespeichert", chat: @ai.chat }, status: :created
    else
      render json: { errors: @ai.errors.full_messages }, status: :unprocessable_entity
    end
  end


  # PATCH/PUT /ais/1 or /ais/1.json
  def update
    respond_to do |format|
      if @ai.update(ai_params)
        format.html { redirect_to @ai, notice: "Ai was successfully updated." }
        format.json { render :show, status: :ok, location: @ai }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @ai.errors, status: :unprocessable_entity }
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
      @ai = Ai.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def ai_params
      params.require(:ai).permit(chat: [ :role, :content ])
    end
end
