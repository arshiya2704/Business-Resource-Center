import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.css';

class Profile extends Component {
  render() {
    const {
      name,
      gitHandler,
      location,
      avatarUrl,
    } = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.avatarContainer}>
          <img className={styles.avatar} src={avatarUrl} alt={`${name} avatar`} />
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.name}>{ name }</div>
          <div className={styles.gitHandler}><i className={classnames('fa fa-facebook-square', styles.gitIcon)}></i> { gitHandler }</div>
          <div className={styles.location}>{ location }</div>
        </div>
      </div>
    );
  }
}

Profile.defaultProps = {

};

Profile.propTypes = {
  name: React.PropTypes.string,
  gitHandler: React.PropTypes.string,
  location: React.PropTypes.string,
  avatarUrl: React.PropTypes.string,
};

export default Profile;
