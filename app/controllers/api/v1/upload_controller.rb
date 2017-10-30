class Api::V1::UploadController < ApplicationController
  include ActionView::Helpers::SanitizeHelper

  def create
    if current_user.nil?
      render 'api/v1/shared/failure', locals: {errors: [{message: 'unauthorized user'}]}, status: :unprocessable_entity and return
    end

    app = App.find_by(id: params[:app_id])
    if app.nil?
      render 'api/v1/shared/failure', locals: {errors: [{message: 'app not found'}]}, status: :unprocessable_entity and return
    end

    @file = UploadedFile.new(file: params[:file])
    @file.app_id = params[:app_id]
    @file.owner_id = current_user.id
    @file.url = ''
    @file.downloads = 0
    @file.created_at = DateTime.now

    if @file.save
      @file.url = @file.file_url
      @file.save
      @status = true
      @url = @file.url
      notify(app, @file)
      render :create
    else
      render 'api/v1/shared/failure', locals: {errors: [@file.errors]}, status: :unprocessable_entity
    end
  end

  def file_params
    params.permit(:file, :content_type, :file_name)
  end

  def notify(app, file)
    ws_msg = {
      adapter: 'pusher',
      channel: "private-app-#{app.permalink}",
      event: 'file_uploaded',
      data: {
        id: file.id,
        owner_id: file.owner_id,
        app_id: file.app_id,
        url: file.url,
        filename: file.file_identifier,
        content_type: file.content_type,
        downloads: file.downloads,
        created_at: file.created_at.to_s,
        uploader: {
          id: current_user.id,
          username: current_user.username,
          avatar_url: current_user.avatar_url,
        },
        app: {
          id: app.id,
          permalink: app.permalink,
          name: app.name,
          avatar_url: app.avatar_url,
        }
      },
      debug_info: {
        location: 'Api::V1::UploadController#notify',
        user_id: current_user.id,
        channel: "private-app-#{app.permalink}",
        event: 'file_uploaded',
        id: file.id,
        owner_id: file.owner_id,
        app_id: file.app_id
      }
    }
    RealTimeNotificationJob.perform_later(ws_msg)
  end

end
