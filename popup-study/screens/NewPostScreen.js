import React from 'react';
import {
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import { gql, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { NavigationStyles } from '@expo/ex-navigation';

import Router from '../navigation/Router';
import Input from '../components/Input';

class NewPostScreen extends React.Component {
  static route = {
    navigationBar: {
      title: 'New Post',
      renderLeft: state => {
        const { config: { eventEmitter } } = state;

        return (
          <Button title="Cancel" onPress={() => eventEmitter.emit('cancel')} />
        );
      },
      renderRight: state => {
        const { config: { eventEmitter } } = state;

        return (
          <Button title="Submit" onPress={() => eventEmitter.emit('submit')} />
        );
      },
    },
    styles: {
      ...NavigationStyles.SlideVertical,
    },
  };

  state = {
    title: '',
    tags: [],
    description: '',
  };

  componentWillMount() {
    this.subscriptionCancel = this.props.route
      .getEventEmitter()
      .addListener('cancel', this.onCancel);
    this.subscriptionSubmit = this.props.route
      .getEventEmitter()
      .addListener('submit', this.onSubmit);
  }

  componentWillUnmount() {
    this.subscriptionCancel.remove();
  }

  onCancel = () => {
    this.props.navigator.pop();
  };

  onSubmit = () => {
    this.props
      .createPost({
        variables: {
          title: this.state.title,
          description: this.state.description,
          authorId: this.props.userId,
        },
      })
      .then(
        ({ data }) => {
          console.log(Router.getRoute('posts'));
          this.props.navigation.getNavigator('posts').push(
            Router.getRoute('post', {
              id: data.createPost.id,
              title: data.createPost.title,
            })
          );
          setTimeout(() => this.props.navigator.pop(), 10);
        },
        err => {}
      );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inputsContainer}>
          <Input
            label="Title"
            onChangeText={title => this.setState({ title })}
            value={this.state.title}
          />
          <View style={styles.spacer} />
          <Input
            label="Description"
            multiline
            style={styles.description}
            onChangeText={description => this.setState({ description })}
            value={this.state.description}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    justifyContent: 'center',
  },
  inputsContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'flex-start',
  },
  spacer: {
    height: 20,
  },
  description: {
    height: 100,
    paddingTop: 5,
  },
});

const createPostMutation = gql`
  mutation createPostMutation($title: String!, $description: String!, $authorId: ID!) {
    createPost(title: $title, description: $description, authorId: $authorId) {
      id
      title
    }
  }
`;

const mapStateToProps = state => ({
  userId: state.app.userId,
});

export default connect(mapStateToProps)(
  graphql(createPostMutation, { name: 'createPost' })(NewPostScreen)
);
