json.set! :notifications do
  json.array! notifications do |notification|

    # when user has invitation (and unread notification) to removed app
    if notification.extra_data.present? and notification.extra_data['app_id'].present?
      app = App.find_by(id: notification.extra_data['app_id'].to_i)
      if app.nil?
        notification.destroy
        next
      end
    end

    json.extract! notification, :id, :text, :created_at, :code
    if notification.initiator.present?
      initiator = notification.initiator
      json.set! :initiator do
        json.model 'User'
        json.id initiator.id
        json.name initiator.first_name
        json.url initiator.username
        json.profile_url initiator.username
        json.username initiator.username
        json.avatar_url initiator.avatar_url(:micro)
      end
    end
    notification.extra_data.each do |key, value|
      json.set! key, value
      case key
        when 'app_id'
          app = App.find_by(id: value.to_i)
          if app.nil?
            json.place ''
          else
            json.set! :place do
              json.tab 'app_root'
              json.name app.name
              json.link app.permalink
            end
          end
        when 'media_id'
          media = Medium.find_by(id: value.to_i)
          if media.nil?
            json.media_title ''
            json.media_thumb_url ''
            json.place ''
          else
            json.media_title media.title
            json.media_thumb_url media.thumb_url
            if media.mediable.nil?
              user = media.uploader
              if user.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'user_gallery'
                  json.name user.first_name
                  json.link user.username
                end
              end
            elsif media.mediable_type == 'Widgets::GalleryWidget::Gallery'
              app = media.mediable.app rescue nil
              if app.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'app_gallery'
                  json.name app.name
                  json.link app.permalink
                end
              end
            elsif media.mediable_type == 'Widgets::BlogWidget::Post'
              app = media.mediable.blog.app rescue nil
              blog_id = media.mediable.blog.id rescue ''
              json.blog_id blog_id
              if app.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'app_blog'
                  json.name app.name
                  json.link app.permalink
                end
              end
            elsif media.mediable_type == 'Note'
              user = media.uploader
              if user.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'user_notes'
                  json.name user.first_name
                  json.link user.username
                end
              end
            end
          end
        when 'note_id'
          note = Note.find_by(id: value.to_i)
          if note.nil?
            json.place ''
            json.note_text ''
          else
            json.note_text note.text.truncate(100)
            user = note.user
            if user.nil?
              json.place ''
            else
              json.set! :place do
                json.tab 'user_notes'
                json.name user.first_name
                json.link user.username
              end
            end
          end
        when 'post_id'
          post = Widgets::BlogWidget::Post.find_by(id: value.to_i)
          if post.nil?
            json.place ''
            json.post_text ''
          else
            json.post_text post.text.truncate(100)
            blog_id = post.blog.id rescue ''
            json.blog_id blog_id
            app = post.blog.app rescue nil
            if app.nil?
              json.place ''
            else
              json.set! :place do
                json.tab 'app_blog'
                json.name app.name
                json.link app.permalink
              end
            end
          end
        when 'comment_id'
          comment = Comment.find_by(id: value.to_i)
          if comment.nil?
            json.comment_text ''
            json.place ''
          else
            json.comment_text comment.body.truncate(100)
            if comment.commentable_type == 'Widgets::GalleryWidget::Gallery'
              app = comment.commentable.app rescue nil
              if app.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'app_gallery'
                  json.name app.name
                  json.link app.permalink
                end
              end
            elsif comment.commentable_type == 'Widgets::BlogWidget::Post'
              app = comment.commentable.blog.app rescue nil
              blog_id = comment.commentable.blog.id rescue ''
              json.blog_id blog_id
              if app.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'app_blog'
                  json.name app.name
                  json.link app.permalink
                end
              end
            elsif comment.commentable_type == 'Note'
              user = comment.commentable.user rescue nil
              if user.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'user_notes'
                  json.name user.first_name
                  json.link user.username
                end
              end
            elsif comment.commentable_type == 'Medium'
              user = comment.commentable.uploader rescue nil
              if user.nil?
                json.place ''
              else
                json.set! :place do
                  json.tab 'user_gallery'
                  json.name user.first_name
                  json.link user.username
                end
              end
            end
          end
      end
    end unless notification.extra_data.blank?
  end
end