/* @flow */
/* eslint-disable max-len */

import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

const createNewApp = gql`
  mutation createNewApp(
    $appType: String!,
    $appName: String!,
    $zip_code: String!,
    $description: String!,
    $widgets: [String],
    $interests: [String],
    $avatar_filename: String!,
    $avatar: String!
  ) {
    createApp(input: {
      type: $appType,
      name: $appName,
      zip_code: $zip_code,
      description: $description,
      widgets: $widgets,
      interests: $interests,
      avatar_filename: $avatar_filename,
      avatar: $avatar
    })
    {
      app {
        id
        name
        avatar_url(version: "micro")
        permalink
      }
    }
  }`;

const updateApp = gql`
  mutation updateApp(
    $id: Int!,
    $appName: String!,
    $zip_code: String!,
    $description: String!,
    $interests: [String],
    $avatar_filename: String!,
    $avatar: String!
  ) {
    updateApp(input: {
      id: $id,
      name: $appName,
      zip_code: $zip_code,
      description: $description,
      interests: $interests,
      avatar_filename: $avatar_filename,
      avatar: $avatar
    })
    {
      app {
        id
        name
        avatar_url(version: "thumb")
        permalink
      }
    }
  }
`;

export default (container) => (
  compose(
    graphql(createNewApp, {
      name: 'createNewApp',
    }),
    graphql(updateApp, {
      name: 'updateApp',
    })
  )(container)
);
