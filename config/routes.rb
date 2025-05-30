Rails.application.routes.draw do
  resources :courses do
    post "like", to: "ratings#like", on: :member
    post "dislike", to: "ratings#dislike", on: :member
    member do
      get :read
    end
  end
  resources :ais
  resources :notes do
    collection do
      post "upload_image"
      post "fetch_image"
    end
    member do
      post :upload_files
      delete :purge_attachment
    end
  end
  devise_for :users
  resources :tasks
  devise_scope :user do
    get "/users/sign_out" => "devise/sessions#destroy"
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
