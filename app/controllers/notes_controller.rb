class NotesController < ApplicationController
  before_action :set_note, only: %i[ show edit update destroy ]

  # GET /notes or /notes.json
  def index
    @notes = Note.all
  end

  # GET /notes/1 or /notes/1.json
  def show
  end

  # GET /notes/new
  def new
    @note = Note.new
  end

  # GET /notes/1/edit
  def edit
  end

  # POST /notes or /notes.json
  def create
    @note = Note.new(note_params)

    respond_to do |format|
      if @note.save
        format.html { redirect_to @note, notice: "Note was successfully created." }
        format.json { render :show, status: :created, location: @note }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @note.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /notes/1 or /notes/1.json
  def update
    @note = Note.find(params[:id])
    if @note.update(note_params)
      head :ok
    else
      head :unprocessable_entity
    end
  end

  # DELETE /notes/1 or /notes/1.json
  def destroy
    @note.destroy!

    respond_to do |format|
      format.html { redirect_to notes_path, status: :see_other, notice: "Note was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def upload_image
    # Create a unique filename
    @filename = "#{SecureRandom.uuid}_#{params[:image].original_filename}"
    
    # Define upload path (create directory if doesn't exist)
    @upload_path = Rails.root.join('public', 'uploads', 'images')
    FileUtils.mkdir_p(@upload_path) unless File.directory?(@upload_path)
    
    # Save the file to the upload path
    File.open(@upload_path.join(@filename), 'wb') do |file|
      file.write(params[:image].read)
    end
    
    # Return the JSON response expected by EditorJS
    render json: {
      success: 1,
      file: {
        url: "/uploads/images/#{@filename}",
        # You can add more metadata if needed
        name: @filename,
        size: params[:image].size
      }
    }
  rescue => e
    # Handle errors
    render json: { success: 0, message: e.message }, status: :unprocessable_entity
  end
  
  def fetch_image
    # Handle images by URL
    image_url = params[:url]
    
    # Download and save the image (consider security implications)
    require 'open-uri'
    
    @filename = "#{SecureRandom.uuid}_#{File.basename(image_url)}"
    @upload_path = Rails.root.join('public', 'uploads', 'images')
    FileUtils.mkdir_p(@upload_path) unless File.directory?(@upload_path)
    
    begin
      # Download the file
      image_data = URI.open(image_url).read
      
      # Save it
      File.open(@upload_path.join(@filename), 'wb') do |file|
        file.write(image_data)
      end
      
      render json: {
        success: 1,
        file: {
          url: "/uploads/images/#{@filename}",
          name: @filename
        }
      }
    rescue => e
      render json: { success: 0, message: e.message }, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_note
      @note = Note.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def note_params
      params.require(:note).permit(content: {}, pictures: []) # Erlaubt JSON-Parameter
    end
end
