module Mention
  extend ActiveSupport::Concern

  included do
    def process_mentions(current_user_id, app = nil)
      text = self.mentioning_text
      return if text.nil?
      results = text.scan(/@[a-zA-Z0-9\_]+/)
      results.each do |result|
        username = result[1..-1]
        user = User.where(username: username).first
        if user.present? and user.id != current_user_id and (app.nil? or not(app.privy?) or app.app_members.where(user_id: user.id).count > 0)
          Notification.create(
            user_id: user.id,
            initiator_type: 'User',
            initiator_id: current_user_id,
            object_type: app.nil? ? self.class.name : app.class.name,
            object_id: app.nil? ? self.id : app.id,
            name: 'users.mention'
          )
        end
      end
    end

  end

end
