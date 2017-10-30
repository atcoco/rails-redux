/* @flow */
/* eslint-disable max-len */

import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

const getMyApp = gql`
  query getMyApp {
    my_app(first: 50) {
      edges {
        node {
          id
          name
          avatar_url(version: "micro")
          description
          members_count
          kind
          likes_count
          liked
          permalink
          total_unread_items_count
          user_role
          type
        }
      }
    }
  }
`;

const disjoinApp = gql`
  mutation disjoinMe($app_id: Int!) {
    disjoinMeFromApp(input: {app_id: $app_id }) {
      app {
        name
      }
    }
  }
`;

const deleteApp = gql`
  mutation destroyApp($id: Int!) {
    destroyApp(input: {id: $id}) {
      status
    }
  }
`;

export default (container) => (
  compose(
    graphql(getMyApp),
    graphql(disjoinApp, {
      name: 'disjoinApp',
    }),
    graphql(deleteApp, {
      name: 'deleteApp',
    }),
  )(container)
);
