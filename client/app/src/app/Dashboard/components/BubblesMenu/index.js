/* @flow */
/* eslint-disable max-len */

import React, { Component } from 'react';
import { Link } from 'react-router';
import IconLock from 'material-ui/svg-icons/action/lock';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';
import CommonStyles from '@utils/CommonStyles';

import hoc from './hoc';

class AppMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openCreateApp: false,
    };
  }

  componentDidMount() {
    const myApp = this.props.getMyApp.my_app;
    if (myApp) {
      if (myApp.edges.length === 0) {
        this.props.toggleAppSearch(false);
      }
    }
    // Quick fix for total counter issue MYB-796
    setTimeout(() => {
      this.props.getMyApp.refetch();
    }, 1200);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refetchApp) {
      this.props.getMyApp.refetch();
      this.props.stopRefetchApp();
    }
  }

  render() {
    if (!this.props.getMyApp.my_app) {
      return (
      <div className='no-app'>
        MyApp loading...
      </div>
      );
    }
    else {
      const { appCounters } = this.props;
      if (!this.props.getMyApp.my_app) {
        return <div>
          You have no app yet.
        </div>;
      }
      // TODO fix
      const myAppInit = this.props.getMyApp.my_app.edges;
      const myApp = JSON.parse(JSON.stringify(myAppInit));

      myApp.sort((app1, app2) => {
        const unreadCount1 = appCounters[app1.node.id] ? appCounters[app1.node.id] : app1.node.total_unread_items_count;
        const unreadCount2 = appCounters[app2.node.id] ? appCounters[app2.node.id] : app2.node.total_unread_items_count;
        if (unreadCount1 > unreadCount2) {
          return -1;
        }
        else if (unreadCount1 < unreadCount2) {
          return 1;
        }
        else {
          return 0;
        }
      });
      // Cache my app data
      // const activeCacheObject = JSON.parse(localStorage.getItem('mapp_activeCache'));
      // activeCacheObject.myApp = true;
      // localStorage.setItem('mapp_activeCache', JSON.stringify(activeCacheObject));

      return (
        <div>
          {
            myApp.length > 0 ?
              (myApp.map((node, index) => {
                const app = node.node;
                const appCounts = this.props.appCounters[app.id] > -1 ?
                    this.props.appCounters[app.id]
                  :
                    app.total_unread_items_count;
                let truncatedString = app.name;
                if (truncatedString.length > 16) {
                  truncatedString = `${truncatedString.substring(0, 16)}...`;
                }
                return (
                  <Link key={app.id} className='myb-feed' to={`/app/${app.permalink}`}>
                    <span className='image-wrapper'>
                      <Avatar
                        src={app.avatar_url}
                        style={CommonStyles.dashAppMenu.appImageStyle} size={32}
                      />
                      {
                        appCounts > 0 ?
                          <span className='app-counter'>
                            <Badge
                              badgeContent={appCounts > 9 ? '10+' : appCounts}
                              badgeStyle={{
                                top: 0,
                                right: -14,
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
                    </span>
                    <span className='myb-feed-label'>
                      {truncatedString}
                    </span>
                    {app.type === 'privy' ?
                      <IconLock style={{ position: 'absolute', top: 16, right: 26, width: 16, height: 16, color: '#bdbdbd' }} />
                    :
                      null
                    }
                  </Link>
                );
              }))
            :
              <div className='no-app'>
                {this.props.keyword ? 'App not found' : 'You don\'t have any app yet, join or create one'}
              </div>
          }
        </div>
      );
    }
  }
}

AppMenu.propTypes = {
  data: React.PropTypes.object,
  keyword: React.PropTypes.string,
  appCounters: React.PropTypes.object,
};

export default hoc(AppMenu);
