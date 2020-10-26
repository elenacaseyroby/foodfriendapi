import React, { Component } from 'react';
import { Logo } from './common/logo/Logo';

class AboutUs extends Component {
  render() {
    const styles = getStyles(this.props.media);
    return (
      <div style={styles.aboutUsPage}>
        <div style={styles.contentContainer}>
          <div style={styles.logoContainer}>
            <Logo />
          </div>
          <div style={styles.comingSoonText}>...coming soon!</div>
        </div>
      </div>
    );
  }
}

const getStyles = (media) => {
  let styles = {};
  styles.aboutUsPage = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#266407',
  };
  styles.contentContainer = {
    width: '30%',
  };
  styles.logoContainer = {
    width: '90%',
  };
  styles.comingSoonText = {
    marginTop: '5%',
    fontFamily: 'Cabin',
    color: '#ffffff',
    fontSize: '2.5vw',
    fontStyle: 'italic',
    textAlign: 'right', 
  };
  return styles;
}

export default AboutUs;
