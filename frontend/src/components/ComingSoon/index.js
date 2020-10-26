import React, { Component } from 'react';

class AboutUs extends Component {
  render() {
    const {media} = this.props;
    const styles = getStyles(media);
    console.log(media.device);
    return (
      <div style={styles.aboutUsPage}>
        <div style={styles.contentContainer}>
          <div style={styles.logoContainer}>
          </div>
          <div style={styles.comingSoonText}>...coming soon!</div>
        </div>
      </div>
    );
  }
}

const getStyles = (media) => {
  let styles = {
    aboutUsPage: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#266407',
    },
    contentContainer: {
      width: '30%',
    },
    logoContainer: {
      width: '90%',
    },
    comingSoonText: {
      marginTop: '5%',
      fontFamily: 'Cabin',
      color: '#ffffff',
      fontSize: '2.5vw',
      fontStyle: 'italic',
      textAlign: 'right', 
    },
  };

  if (media.device === 'desktop') {
    // header & bottom elipse should cover entire width
  }
  return styles;
}

export default AboutUs;
