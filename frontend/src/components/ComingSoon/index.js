import React, { Component } from 'react';
import header from './assets/header.svg';

class AboutUs extends Component {
  render() {
    const {media} = this.props;
    const styles = getStyles(media);
    return (
      <div style={styles.comingSoonPage}>
        <div style={styles.header} />
        <div style={styles.footer} >
          {/* <img src={bottomElipse} style={styles.footerImg} /> */}
        </div>
      </div>
    );
  }
}

const getStyles = (media) => {
  const {windowHeight, device} = media;
  let styles = {
    comingSoonPage: {
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      postion: 'relative',
    },
    header: {
      width: '100%',
      height: windowHeight / 2,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundImage: `url(${header})`,
      postion: 'absolute',
    },
    footer: {
      height: windowHeight / 2,
      width: '150%',
      alignSelf: 'center',
      backgroundColor: '#ffe3b8',
      borderRadius: '50%',
      position: 'absolute',
      bottom: - (windowHeight / 4),
    },
  };
  return styles;
}

export default AboutUs;
