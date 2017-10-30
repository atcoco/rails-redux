/* @flow */
/* eslint-disable max-len */

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const addAppWidget = gql`
  mutation addWidgetMutation($app_id: Int!, $name: String!) {
    addWidget(input: {app_id: $app_id, name: $name}) {
      status
    }
  }
`;

export default (container) => (
  graphql(addAppWidget, {
    name: 'addAppWidget',
  })(container)
);
