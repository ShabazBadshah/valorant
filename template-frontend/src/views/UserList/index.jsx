import React, { Component } from 'react';

// Externals
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';

// Material helpers
import { withStyles } from '@material-ui/core';

// Material components
import { CircularProgress, Typography } from '@material-ui/core';

// Shared layouts
import { Dashboard as DashboardLayout } from '../../layouts';

// Shared services
import { getAllUsers } from '../../services/user';

// Custom components
import { UsersToolbar, UsersTable } from './components';

// Component styles
import styles from './style';

class UserList extends Component {
  signal = true;

  state = {
    isLoading: false,
    users: [],
    error: null
  };

  async getAllUsers() {
    try {
      this.setState({ isLoading: true });
      const { users } = await getAllUsers();

      if (this.signal) {
        this.setState({
          isLoading: false,
          users
        });

        this.fuse = new Fuse(users, {
          keys:['name', 'id', 'phone', 'street', 'zipCode', 'city']
        })

      }
    } catch (error) {
      if (this.signal) {
        this.setState({
          isLoading: false,
          error
        });
      }
    }
  }

  componentDidMount() {
    this.signal = true;
    this.getAllUsers();
  }

  componentWillUnmount() {
    this.signal = false;
  }

  async searchUser(searchQuery) {
    // Show all users if list is empty
    // TODO fetching all users again on empty profileName search, cache users locally (pref improvement)
    if (searchQuery === '') {
      const { users } = await getAllUsers();
      this.setState({ users });
      return;
    } else {
      const users = this.fuse.search(searchQuery);
      const filteredUsers = users.map(user => user.item);
      this.setState({ users:filteredUsers });
      return;
    }
  }

  renderUsers() {
    const { classes } = this.props;
    const { isLoading, users, error } = this.state;

    if (isLoading) {
      return (
        <div className={classes.progressWrapper}>
          <CircularProgress />
        </div>
      );
    }

    if (error) {
      return <Typography variant="h6">{error}</Typography>;
    }

    if (users.length === 0) {
      return <Typography variant="h6">There are no users</Typography>;
    }

    return (
      <UsersTable
        //
        onSelect={this.handleSelect}
        users={users}
      />
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <DashboardLayout title="Users">
        <div className={classes.root}>
          <UsersToolbar searchUser={event => this.searchUser(event.target.value)}/>
          <div className={classes.content}>{this.renderUsers()}</div>
        </div>
      </DashboardLayout>
    );
  }
}

UserList.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UserList);