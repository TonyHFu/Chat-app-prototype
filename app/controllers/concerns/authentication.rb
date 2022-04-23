#Not used, from a different tutorial
module Authentication
	extend ActiveSupport::Concern

	included do
		before_action :current_user
		helper_method :current_user
		helper_method :user_signed_in?
	end

	def login(user)
		reset_session
		session[:current_user_id] = user.id
	end

	def logout
		reset_ression
	end

	def redirect_if_authenticated
		if user_signed_in?
			redirect_to root_path, alert: 'You are already logged in.'
		end
	end

	def authenticate_user!
		unless user_signed_in?
			redirect_to root_path, alert: 'You need to login to access that page.'
		end
	end

	private

	def current_user
		Current.user ||=
			session[:current_user_id] && User.find_by(id: session[:current_user_id])
	end

	def user_signed_in?
		Current.user.present?
	end
end
