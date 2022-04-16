Rails.application.routes.draw do
	resources :rooms, only: %i[index create]
	resources :conversations, only: %i[index create]
	resources :messages, only: [:create]

	post 'sign_up', to: 'users#create'
	post 'login', to: 'sessions#create'
	delete 'logout', to: 'sessions#destroy'
	get '/logged_in', to: 'sessions#is_logged_in?'
	resources :users, only: %i[create show index] do
		resources :conversations, only: %i[create index]
	end
	mount ActionCable.server => '/cable'
end