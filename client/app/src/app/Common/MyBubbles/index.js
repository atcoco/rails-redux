/* @flow */

import React, { Component } from 'react';
import { notify } from 'react-notify-toast';
import { Link } from 'react-router';
import ReactGA from 'react-ga';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Badge from 'material-ui/Badge';
import Avatar from 'material-ui/Avatar';
import IconLock from 'material-ui/svg-icons/action/lock';
import IconSocialPeople from 'material-ui/svg-icons/social/people';
import IconActionFavorite from 'material-ui/svg-icons/action/favorite';
import IconSocialGroupRemove from 'material-ui/svg-icons/content/remove-circle';
import IconActionDelete from 'material-ui/svg-icons/action/delete';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import CommonStyles from '@utils/CommonStyles';

import hoc from './hoc';

class MyApp extends Component {
  static contextTypes = {
    pusher: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      openAppDeleteDialog: false,
      app_id: null,
      appCounters: {},
    };
  }

  componentWillMount = () => {
    this.subscribeToDashboardChannel();
  }

  componentWillUnmount = () => {
    this.unsubscribeFromDashboardChannel();
  }

  subscribeToDashboardChannel = () => {
    const self = this;
    const pusher = this.context.pusher;
    const currentUser = JSON.parse(localStorage.getItem('mapp_user'));
    let channel = pusher.channels.channels[`private-dashboard-${currentUser.id}`];
    this.setState({
      currentUserId: currentUser.id,
    });
    if (!channel) {
      channel = pusher.subscribe(`private-dashboard-${currentUser.id}`);
    }

    channel.bind('total_unread_items_count_changed', (data) => {
      const appCounters = self.state.appCounters;
      appCounters[data.app.id] = data.total_unread_items_count;
      self.setState({ appCounters });
    });
  }

  unsubscribeFromDashboardChannel = () => {
    const pusher = this.context.pusher;
    let currentUserId = this.state.currentUserId;
    if (localStorage.getItem('mapp_user')) {
      currentUserId = JSON.parse(localStorage.getItem('mapp_user')).id;
    }
    const channel = pusher.channels.channels[`private-dashboard-${currentUserId}`];
    if (channel) {
      channel.unbind('total_unread_items_count_changed');
      // pusher.unsubscribe("private-dashboard-" + currentUserId);
    }
  }

  disjoinApp = (app_id) => {
    const self = this;
    this.props.disjoinApp(
      { variables: { app_id: parseInt(app_id, 10) } }
    ).then((graphQLResult) => {
      const { errors } = graphQLResult;

      if (errors) {
        if (errors.length > 0) {
          notify.show(errors[0].message, 'error', 2000);
        }
      }
      else {
        notify.show('You left app successfully!', 'success', 2000);
        self.props.data.refetch();

        ReactGA.event({
          category: 'App',
          action: 'Disjoined a app',
        });
      }
    }).catch((error) => {
      notify.show(error.message, 'error', 2000);
    });
  }

  deleteApp = () => {
    const app_id = this.state.app_id;
    const self = this;

    this.handleCloseAppDeleteDialog();
    if (!app_id) {
      return;
    }
    this.props.deleteApp({ variables: { id: parseInt(app_id, 10) } })
    .then((graphQLResult) => {
      const { errors } = graphQLResult;

      this.handleCloseAppDeleteDialog();

      if (errors) {
        notify.show(errors[0].message, 'error');
      }
      else {
        notify.show('App deleted successfully!', 'success', 3000);
        self.props.data.refetch();
        ReactGA.event({
          category: 'App',
          action: 'Deleted a app',
        });
      }
    }).catch((error) => {
      notify.show(error.message, 'error');
    });
  }

  openDeleteDialog = (e, app_id) => {
    e.preventDefault();
    this.setState({
      openAppDeleteDialog: true,
      app_id: app_id,
    });
  }

  handleCloseAppDeleteDialog = () => {
    this.setState({
      openAppDeleteDialog: false,
      app_id: null,
    });
  }

  render() {
    if (this.props.data.errors) {
      if (this.props.data.errors.message !== '') {
        setTimeout(() => {
          this.props.router.push('/signin');
        }, 50);
        setTimeout(()=> {
          localStorage.setItem('mapp_client_id', '');
          localStorage.setItem('mapp_token', '');
          localStorage.setItem('mapp_user', '');
          localStorage.setItem('mapp_username', '');
        }, 1000);
        return;
      }
    }
    if (this.props.data.loading) {
      return (<div>My Bybbles loading ...</div>);
    }

    const app = this.props.data.my_app.edges;

    const appCount = app.length;
    if (!appCount) {
      return (
        <div style={CommonStyles.userApp.containerStyle}>
          No app yet
        </div>
      );
    }

    const subheaderStyles = {
      fontSize: 13,
      borderBottom: '1px solid #f1f1f1',
      borderTop: '1px solid #f1f1f1',
      lineHeight: '42px',
      marginBottom: 12,
      display: 'flex',
      alignitems: 'center',
      justifyContent: 'space-between',
      textTransform: 'uppercase',
    };

    return (
      <List className='app-list' style={{ backgroundColor: '#ffffff', overflow: 'auto' }}>
        <Subheader style={subheaderStyles}>App</Subheader>
        {
          app.length > 0 ?
            (app.map((item, index) => {
              const app = item.node;
              const appCounts = this.state.appCounters[app.id] ?
                  this.state.appCounters[app.id]
                :
                  app.total_unread_items_count;
              return (
                <div
                  key={app.id}
                  className='app-item' style={{ padding: '0 12px', margin: '20px 0 0 0', float: 'left', minHeight: 240, width: '33%', textAlign: 'center' }}>

                  <div style={{ left: 0 }}>
                    <Link to={`/app/${app.permalink}`}>
                      <Avatar
                        src={app.avatar_url}
                        size={56}
                      />
                    </Link>
                    {
                      appCounts > 0 ?
                        <span className='app-counter'>
                          <Badge
                            badgeContent={appCounts > 9 ? '10+' : appCounts}
                            badgeStyle={{
                              top: 6,
                              right: 0,
                              width: 16,
                              height: 16,
                              fontSize: 8,
                              fontWeight: 400,
                              backgroundColor: (appCounts ? '#D97575' : 'transparent'),
                              color: '#FFFFFF',
                            }}
                            style={{ padding: 0 }}
                          />
                        </span>
                      :
                        null
                    }
                  </div>

                  {
                    app.type === 'privy' ?
                      <span style={{ margin: '12px 0', display: 'block', height: '17px', overflow: 'hidden' }}>{app.name} <IconLock style={{ top: 8, width: 16, height: 16, color: '#bdbdbd' }} /></span>
                    :
                      <span style={{ margin: '12px 0', display: 'block', height: '17px', overflow: 'hidden' }}>{app.name}</span>
                  }

                  <div>
                    <IconSocialPeople color={CommonStyles.userApp.grayColor} style={{ ...CommonStyles.userApp.iconStyle, marginRight: 5 }} />
                    <span style={CommonStyles.userApp.statStyle}>{app.members_count}</span>
                    <IconActionFavorite color={CommonStyles.userApp.grayColor} style={{ ...CommonStyles.userApp.iconStyle, marginLeft: 10, marginRight: 5 }} />
                    <span style={CommonStyles.userApp.statStyle}>{app.members_count}</span>
                  </div>

                <div className='app-actions' style={{ height: 40, top: 0, margin: '20px auto' }}>

                  <Link to={`/app/${app.permalink}`} style={{ top: '12px', right: '0px' }}>
                    <RaisedButton
                      className='view-button'
                      color='#ffffff'
                      hoverColor='#62db95'
                      label='View'
                      labelStyle={{ textTransform: 'none', color: '#62db95' }}
                      style={{ boxShadow: 'none', border: '2px solid #62db95', borderRadius: '4px' }}
                    />
                  </Link>
                  &nbsp;
                  {app.user_role === 'owner' ?
                    <RaisedButton
                      className='delete-button'
                      color='#ffffff'
                      hoverColor='#D97575'
                      label='Delete'
                      labelStyle={{ textTransform: 'none', color: '#D97575' }}
                      icon={<IconActionDelete style={{ marginLeft: 6 }} />}
                      onClick={(event) => this.openDeleteDialog(event, app.id)}
                      style={{ boxShadow: 'none', border: '2px solid #D97575', borderRadius: '4px' }}
                    />
                    :
                    <RaisedButton
                      className='delete-button'
                      color='#ffffff'
                      hoverColor='#D97575'
                      label='Leave'
                      labelStyle={{ textTransform: 'none', color: '#D97575' }}
                      icon={<IconSocialGroupRemove style={{ marginLeft: 6 }} />}
                      onClick={() => this.disjoinApp(app.id)}
                      style={{ boxShadow: 'none', border: '2px solid #D97575', borderRadius: '4px' }}
                    />
                  }
                </div>
              </div>
              );
            }))
          :
            <div className='no-app'>
              You don't have any app yet, join or create one
            </div>
        }
        <Dialog
          title='Delete App Confirmation'
          actions={[
            <FlatButton
              label='Cancel'
              primary
              keyboardFocused
              onTouchTap={this.handleCloseAppDeleteDialog}
            />,
            <FlatButton
              label='Delete'
              secondary
              onTouchTap={this.deleteApp}
            />,
          ]}
          modal={false}
          open={this.state.openAppDeleteDialog}
          onRequestClose={this.handleCloseAppDeleteDialog}
        >
          Are you really sure you want to delete this app?<br />
          <strong>This can not be undone.</strong>
        </Dialog>
      </List>
    );
  }
}

export default hoc(MyApp);
