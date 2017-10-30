/* @flow */
/* eslint-disable max-len */

import React, { Component } from 'react';
import { notify } from 'react-notify-toast';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import IconTrending from 'material-ui/svg-icons/action/trending-up';
import CommonStyles from '@utils/CommonStyles';

import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import hoc from './hoc';

class InterestingApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app: [],
    };

  }

  loadMoreApp = () => {
    let _app = this.state.app;
    if (!_app.length) {
      _app = this.props.data.interesting_app.edges;
    }
    if (!_app.length) {
      return;
    }

    if (this.props.viewMore) {
      // Update feed data
      if (_app) {
        _app.forEach((app) => {
          _app.splice(3, 3);
        });
      }
      this.setState({
        app: _app,
      });
      this.props.onClickViewMore(false);

    }
    else {

      this.props.client.query({
        query: gql`
          query getMyApp($version: String!) {
            interesting_app(first: 12) {
              edges {
                cursor
                node {
                  name
                  permalink
                  avatar_url(version: $version)
                }
              }
            }
          }
        `,
        variables: {
          version: 'micro',
        },
        activeCache: false,
        forceFetch: true,
      }).then((graphQLResult) => {

        const { errors, data } = graphQLResult;

        if (errors) {
          if (errors.length > 0) {
            notify.show(errors[0].message, 'error', 2000);
          }
        }
        else {
          // Update feed data
          this.setState({
            app: data.interesting_app.edges,
          });
          this.props.onClickViewMore(true);
        }

      }).catch((error) => {
        notify.show(error.message, 'error', 2000);
      });

    }
  }

  render() {

    if (!this.props.data.interesting_app) {
      return (
        <div>
          Trending app loading...
        </div>
      );
    }
    else {
      const interesting_app = this.state.app.length && this.props.viewMore ? this.state.app : this.props.data.interesting_app.edges;

      const titleStyle = {
        fontSize: 15,
        color: '#686868',
        textTransform: 'uppercase',
        marginBottom: '8px',
        marginTop: '18px',
      };
      const avatarContainerStyle = {
        marginRight: 12,
        marginBottom: 12,
        position: 'relative',
        float: 'left',
        color: '#000',
      };
      let view_more = null;
      if (interesting_app.length >= 3) {
        view_more = <a className='view_more' onClick={this.loadMoreApp.bind(this)}>View more</a>;
        if (this.props.viewMore) {
          view_more = <a className='view_more' onClick={this.loadMoreApp.bind(this)}>View less</a>;
        }
      }
      return (
        <div style={{ marginBottom: 10 }}>
          <Divider style={CommonStyles.dividerStyle} />
          <div style={titleStyle}>
            <IconTrending color='#686868' style={{ verticalAlign: '-30%', marginRight: '4px' }}/>Trending App
          </div>
          <div className='mui--clearfix'>
            <div className='inner-wrapper'>
              {interesting_app.map((app, index)=>{
                let appname = `${app.node.name}`;
                if (appname.length > 7) {
                  appname = `${appname.substring(0, 7)}...`;
                }
                return (
                  <Link key={index} style={avatarContainerStyle} to={`/app/${app.node.permalink}`}>
                    <div className='avatar-wrapper'>
                      <Avatar src={app.node.avatar_url} />
                    </div>
                    <div className='username-wrapper'>{appname}</div>
                  </Link>
                );
              })}
            </div>
          </div>
          {view_more}
        </div>
      );
    }
  }
}

export default withApollo(hoc(InterestingApp));
