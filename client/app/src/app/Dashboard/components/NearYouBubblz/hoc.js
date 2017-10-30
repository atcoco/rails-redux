/* @flow */
/* eslint-disable max-len */

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const getMyApp = gql`
  query getMyApp {
    interesting_app(first: 10) {
      edges {
        cursor
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

export default (container) => (
  graphql(getMyApp)(container)
);
