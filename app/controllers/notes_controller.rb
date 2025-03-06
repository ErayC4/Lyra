class NotesController < ApplicationController
  before_action :authenticate_user!
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
    # Sicherheitsprüfungen
    return head :forbidden unless params[:image] && valid_image?(params[:image])

    # Bild mit Active Storage speichern
    blob = ActiveStorage::Blob.create_and_upload!(
      io: params[:image],
      filename: params[:image].original_filename,
      content_type: params[:image].content_type,
      identify: true # Bild validieren
    )

    # URL generieren und zurückgeben (in dem Format, das Editor.js erwartet)
    render json: {
      success: 1,
      file: {
        url: url_for(blob),
        # Optional: Weitere Metadaten
        name: blob.filename.to_s,
        size: blob.byte_size
      }
    }
  rescue StandardError => e
    Rails.logger.error("Bildupload fehlgeschlagen: #{e.message}")
    render json: { success: 0, error: "Upload fehlgeschlagen" }, status: :unprocessable_entity
  end

  # POST /notes/fetch_image
  def fetch_image
    return head :forbidden unless params[:url] && valid_url?(params[:url])

    # Hier können Sie ein Bild von einer URL herunterladen
    # Dies ist komplexer und erfordert zusätzliche Sicherheitsmaßnahmen
    # Einfaches Beispiel:
    begin
      uri = URI.parse(params[:url])
      response = Net::HTTP.get_response(uri)
      
      if response.code == "200" && response.content_type.start_with?('image/')
        tempfile = Tempfile.new(['download', File.extname(uri.path)])
        tempfile.binmode
        tempfile.write(response.body)
        tempfile.rewind

        blob = ActiveStorage::Blob.create_and_upload!(
          io: tempfile,
          filename: File.basename(uri.path),
          content_type: response.content_type,
          identify: true
        )
        
        render json: {
          success: 1,
          file: {
            url: url_for(blob)
          }
        }
      else
        render json: { success: 0, error: "Ungültiger Inhalt" }, status: :unprocessable_entity
      end
    rescue => e
      render json: { success: 0, error: e.message }, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def valid_image?(image)
      # Erlaubte MIME-Typen definieren
      allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      # Maximale Dateigröße (5MB)
      max_size = 5.megabytes
      
      # Typprüfung und Größenprüfung
      allowed_types.include?(image.content_type) && image.size <= max_size
    end
    
    # Validierung der URL für fetch_image
    def valid_url?(url)
      uri = URI.parse(url)
      uri.is_a?(URI::HTTP) && !uri.host.nil?
    rescue URI::InvalidURIError
      false
    end
    def set_note
      @note = Note.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def note_params
      params.require(:note).permit(content: {}, pictures: []) # Erlaubt JSON-Parameter
    end
end
