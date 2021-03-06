class Conversation < ApplicationRecord
	has_many :messages
	belongs_to :requester, class_name: 'User'
	belongs_to :accepter, class_name: 'User'

	validates_uniqueness_of :requester, scope: [:accepter]
	validate :users_are_not_already_friends, on: :create

	validate :cannot_add_self, on: :create

	private
	# Validations
	def users_are_not_already_friends
		if Conversation.where(requester_id: accepter_id, accepter_id: requester_id)
				.exists? ||
				Conversation.where(requester_id: requester_id, accepter_id: accepter_id)
					.exists?
			self.errors.add(:requester_id, 'Already friends!')
		end
	end

	def cannot_add_self
		errors.add(:requester_id, "can't add self!") if accepter_id == requester_id
	end
end
