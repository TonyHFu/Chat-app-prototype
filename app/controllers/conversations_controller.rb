class ConversationsController < ApplicationController
	def index
		conversations = Conversation.all
		render json: conversations
	end

	def create
		conversation = Conversation.new(conversation_params)
		if conversation.save
			serialized_data =
				ActiveModelSerializers::Adapter::Json.new(
					ConversationSerializer.new(conversation),
				).serializable_hash

			ActionCable.server.broadcast(
				# 'conversations_channel',
				"current_user_#{current_user.id}",
				serialized_data,
			)
			head :ok
		end
	end

	private

	def conversation_params
		params.require(:conversation).permit(:title, :user_id)
	end
end
