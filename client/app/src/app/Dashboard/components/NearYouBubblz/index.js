/* @flow */

import React, { Component } from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';
import IconLock from 'material-ui/svg-icons/action/lock';
import IconSocialPeople from 'material-ui/svg-icons/social/people';
import IconActionFavorite from 'material-ui/svg-icons/action/favorite';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import CommonStyles from '@utils/CommonStyles';

import hoc from './hoc';

class NearYouApp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      app_id: null,
    };
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
      return (<div>App near you loading ...</div>);
    }

    const app = this.props.data.interesting_app.edges;

    const appCount = app.length;
    if (!appCount) {
      return (
        <div style={CommonStyles.userApp.containerStyle}>
          App near you not found
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
        <Subheader style={subheaderStyles}>App near you</Subheader>
        {
          app.length > 0 ?
            (app.map((item, index) => {
              const app = item.node;
              return (
                <div
                  key={app.id}
                  className='app-item'
                  style={{ padding: '0 12px', margin: '20px 0 0 0', float: 'left', minHeight: 190, width: '20%', textAlign: 'center' }}
                >
                  <div style={{ left: 0 }}>
                    <Link to={`/app/${app.permalink}`}>
                      <Avatar
                        src={app.avatar_url}
                        size={56}
                      />
                    </Link>
                  </div>

                  {
                    app.type === 'privy' ?
                      <span style={{ margin: '12px 0', display: 'block', height: '17px', overflow: 'hidden' }}>
                        <Link to={`/app/${app.permalink}`}>
                          {app.name} <IconLock style={{ top: 8, width: 16, height: 16, color: '#bdbdbd' }} />
                        </Link>
                      </span>
                    :
                      <span style={{ margin: '12px 0', display: 'block', height: '17px', overflow: 'hidden' }}>
                        <Link to={`/app/${app.permalink}`}>
                          {app.name}
                        </Link>
                      </span>
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

                </div>
              </div>
              );
            }))
          :
            <div className='no-app'>
              App near you not found
            </div>
        }
      </List>
    );
  }
}

export default hoc(NearYouApp);
