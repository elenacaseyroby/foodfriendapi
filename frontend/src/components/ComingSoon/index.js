import React, { Component } from 'react';
import header from './assets/header.svg';
import benny from './assets/benny-and-food.svg';

class AboutUs extends Component {
  render() {
    const {media} = this.props;
    const styles = getStyles(media);
    return (
      <div style={styles.comingSoonPage}>
        <div style={styles.header} />
        {/* <div style={styles.elipseContainer}>
          <div style={styles.elipse} />
        </div> */}
        <img src={benny} style={styles.benny}/>
      </div>
    );
  }
}

const getStyles = (media) => {
  const {windowHeight, windowWidth, normalizer, device} = media;
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
    benny: {
      postion: 'absolute',
      marginTop: - windowHeight/3,
      height: undefined,
      // aspectRatio: width / height,
      aspectRatio: 604 / 418,
      alignSelf: 'center',
    },
    // elipseContainer: {
    //   width: '90%',
    //   position: 'relative',
    //   overflow: 'hidden',
    //   backgroundColor: 'green',
    //   // alignItems: 'center',
    //   // justifyContent: 'center',
    // },
    // elipse: {
    //   height: windowHeight / 2,
    //   width: windowWidth * 1.5,
    //   backgroundColor: '#ffe3b8',
    //   borderRadius: '50%',
    //   marginRight: '50%',
    //   marginLeft: '50%',
    //   // alignSelf: 'center',
    //   // position: 'absolute',
    //   // bottom: - (windowHeight / 4),
    // },
  };
  if (device === 'mobile') {
    styles.benny.width = 300;
    styles.benny.marginTop = - windowHeight/4;
  } else if (device === 'tablet') {
    styles.benny.width = 400;
    styles.benny.marginTop = - windowHeight/3;
  } else {
    styles.benny.width = 550;
    styles.benny.marginTop = - windowHeight/2.2;
  }
  return styles;
}

export default AboutUs;
