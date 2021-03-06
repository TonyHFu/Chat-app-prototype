class ConversationsController < ApplicationController
	def index
		return render json: [] if !current_user

		#Gets all conversations
		requested_friendships = current_user.requested_friendships

		accepted_friendships = current_user.accepted_friendships

		all_friendships = requested_friendships + accepted_friendships

		all_messages =
			all_friendships.map do |friendship|
				#Sets friend id and friend record
				if friendship.requester_id == current_user.id
					friend_id = friendship.accepter_id
				else
					friend_id = friendship.requester_id
				end
				friend = User.find(friend_id)

				messages = friendship.messages

				#Returns information needed for each conversation
				{
					id: friendship.id,
					friend_id: friend_id,
					friend_first_name: friend.first_name,
					friend_last_name: friend.last_name,
					accepted: friendship.accepted,
					deleted: friendship.deleted,
					requester_id: friendship.requester_id,
					accepter_id: friendship.accepter_id,
					seen: friendship.seen,
					messages: messages,
				}
			end

		render json: all_messages
	end

	def create
		#Creates a new conversation with accept, deleted, and seen defaulted to false
		conversation =
			Conversation.new(
				{ **conversation_params, accepted: false, deleted: false, seen: false },
			)
		if conversation.save
			#Sends cable to user with action: create
			serialized_data =
				ActiveModelSerializers::Adapter::Json.new(
					ConversationSerializer.new(conversation),
				).serializable_hash

			ActionCable.server.broadcast(
				# 'conversations_channel',
				"current_user_#{current_user.id}",
				{ **serialized_data, action: 'create' },
			)

			ActionCable.server.broadcast(
				# Broadcast to user/receiver private channel
				"current_user_#{params['accepter_id']}",
				{ **serialized_data, action: 'create' },
			)

			#Saves a initializer message for sorting and message preview purposes
			message =
				conversation.messages.new(
					text: 'request',
					sender_id: conversation.requester_id,
					receiver_id: conversation.accepter_id,
					seen: false,
					initializer: true,
				)
			message.save!

			head :ok
		end
	end

	def destroy
		conversation = Conversation.find(params[:id])
		conversation.deleted = true

		#Do not proceed if current user is not part of conversation
		if current_user.id != conversation.requester_id &&
				current_user.id != conversation.accepter_id
			conversation.deleted = false
			puts 'unable to delete a conversation you do not own'
		end

		#Sends cable to both users with action: delete
		if conversation.save
			serialized_data =
				ActiveModelSerializers::Adapter::Json.new(
					ConversationSerializer.new(conversation),
				).serializable_hash

			ActionCable.server.broadcast(
				# Broadcast to accepter private channel
				"current_user_#{conversation.accepter_id}",
				{ **serialized_data, action: 'delete' },
			)

			ActionCable.server.broadcast(
				# Broadcast to requester private channel
				"current_user_#{conversation.requester_id}",
				{ **serialized_data, action: 'delete' },
			)
			head :ok
		end
	end

	#On seen or accept actions
	def update
		conversation = Conversation.find(params[:id])

		#Depending on action type, sets conversation columns
		if params[:action_type] == 'accept'
			puts 'action type is accept'
			conversation.seen = false
			conversation.accepted = true
		elsif params[:action_type] == 'seen'
			puts 'action type is seen'
			conversation.seen = true
		end

		#Do not proceed if current user is not part of conversation
		if current_user.id != conversation.requester_id &&
				current_user.id != conversation.accepter_id
			return puts 'unable to update a conversation you do not own'
		end

		if conversation.save
			if params[:action_type] == 'seen'
				#Change all messages to seen
				conversation.messages.each do |message|
					message.seen = true
					message.save!
				end
			end

			if params[:action_type] == 'accept'
				#Creates initializer message for sorting and message preview
				message =
					conversation.messages.new(
						text: 'accept',
						sender_id: conversation.accepter_id,
						receiver_id: conversation.requester_id,
						seen: false,
						initializer: true,
					)
				message.save!
			end

			#Sends cable to both users with action: action_type (accept/seen)
			serialized_data =
				ActiveModelSerializers::Adapter::Json.new(
					ConversationSerializer.new(conversation),
				).serializable_hash

			ActionCable.server.broadcast(
				# Broadcast to accepter private channel
				"current_user_#{conversation.accepter_id}",
				{ **serialized_data, action: params[:action_type] },
			)

			ActionCable.server.broadcast(
				# Broadcast to requester private channel
				"current_user_#{conversation.requester_id}",
				{ **serialized_data, action: params[:action_type] },
			)
			head :ok
		end
	end

	private

	def conversation_params
		params.require(:conversation).permit(:requester_id, :accepter_id)
	end
end
