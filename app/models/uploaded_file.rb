class UploadedFile < ActiveRecord::Base
  mount_uploader :file, FileUploader

  belongs_to :app
  belongs_to :user, foreign_key: :owner_id

end
