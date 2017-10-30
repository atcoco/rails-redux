/* @flow */
/* eslint-disable max-len */

import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

const changePermission = gql`
  mutation adminChangePermission($username: String!, $admin: Int!) {
    changePermission(input: {username: $username, admin: $admin}) {
      status
    }
  }
`;

const disableAppWidget = gql`
  mutation disableWidgetMutation($app_id: Int!, $name: String!) {
    disableWidget(input: {app_id: $app_id, name: $name}) {
      status
    }
  }
`;

export default (container) => (
  compose(
    graphql(changePermission, {
      name: 'changePermission',
    }),
    graphql(disableAppWidget, {
      name: 'disableAppWidget',
    }),
  )(container)
);
