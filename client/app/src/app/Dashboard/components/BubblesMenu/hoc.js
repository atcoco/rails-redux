/* @flow */
/* eslint-disable max-len */

import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';

const getMyApp = gql`
  query getMyApp($first: Int!, $keyword: String) {
    my_app(first: $first, keyword: $keyword) {
      edges {
        node {
          id
          name
          total_unread_items_count
          avatar_url(version: "micro")
          permalink
          type
        }
      }
    }
  }
`;

export default (container) => (
  graphql(getMyApp, {
    name: 'getMyApp',
    options: (ownProps) => ({
      variables: {
        first: ownProps.allApp ? 100 : 10,
        keyword: ownProps.keyword || '',
      },
    }),
    forceFetch: true,
    activeCache: false,
  })(withRouter(container))
);
