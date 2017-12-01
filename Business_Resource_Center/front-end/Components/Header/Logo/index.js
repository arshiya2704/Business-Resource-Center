import React, { Component } from 'react';
import styles from './styles';
import logo from './sbrc_logo.png';

const Logo = () => {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logo}>
        <img src={logo} style={{height : 40 , width : 80}}/>
      </div>
      <div className={styles.logoTitle}>Business Resource Center</div>
    </div>
  );
};

export default Logo;
