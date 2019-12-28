
import React, { Component } from "react";
import { Text, View, Alert, AsyncStorage } from "react-native";
import firebase from "react-native-firebase";
import { Header, Button, Spinner, CardSection } from "./components/common";
import LoginForm from "./components/LoginForm";
import { USER_URL, LOGOUT_URL, TOKEN_FCM_URL } from "./config/URL";
import Login from "./components/Login";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggeIn: null,
      user: "",
      token: "",
      body: "",
      title: ""
    };
    this.getKey = this.getKey.bind(this);
    this.login = this.login.bind(this);
    this.saveToken = this.saveToken.bind(this);
  }

  componentWillUnmount() {
    this.notificationListener;
    this.notificationOpenedListener;
  }

  async componentDidMount() {
    this.login();
    this.checkPermission();
    this.createNotificationListeners(); //add this line
  }

  async saveToken(fcmToken,id) {
      //Token Save POST
    this.getKey().then(value => {
        fetch(TOKEN_FCM_URL + "/" + id + "/" + fcmToken, {
          method: "POST",
          body: JSON.stringify({
            token: value
          }),
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
          }
        })
          .then(response => response.json())
          .then(json => {
            console.log("JSONSAVE", json);
          })
          .catch(error => {
            console.log("ERRORSAVE", error);
          });
    });
    //End Token Save Post
  }

  async getKey() {
    try {
      const value = await AsyncStorage.getItem("token");
      // console.log('accediendo la key',value);
      return value;
    } catch (error) {
      console.log("Error retrieving data" + error);
    }
  }
  async getUser() {
    try {
      const value = await AsyncStorage.getItem("userId");
      // console.log('accediendo la key',value);
      return value;
    } catch (error) {
      console.log("Error retrieving data" + error);
    }
  }

  login() {
    this.getKey().then(value => {
      //console.log('value',value)
      fetch(USER_URL, {
        method: "POST",
        body: JSON.stringify({
          token: value
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      })
        .then(response => response.json())
        .then(json => {
          console.log("JSON", json);
          if (json.error) {
            this.setState({ loggeIn: false });
          } else {
            this.setState({ loggeIn: true });
            console.log("loggeIn", this.state.loggeIn);
            this.setState({
              user: json
            });
          }
        })
        .catch(error => {
          console.log("ERROR", error);
          this.setState({ loggeIn: false });
          console.log("loggeIn", this.state.loggeIn);
        });
    });
  }

  onButtonPressLogout() {
    this.getKey().then(value => {
      //    console.log(value)
      fetch(LOGOUT_URL, {
        method: "POST",
        body: JSON.stringify({
          token: value
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      })
        .then(response => response.json())
        .then(json => {
          console.log("JSON", json);
          this.setState({
            loggeIn: false,
            user: ""
          });
        })
        .catch(error => {
          console.log("ERROR", error);
        });
    });
  }

  renderContent() {
    switch (this.state.loggeIn) {
      case true:
        return <Login />;
      case false:
        return <LoginForm />;
      default:
        return <Spinner size="large" />;
    }
  }
  //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        //console.log('fcmToken:', fcmToken);
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
    // console.log('fcmToken:', fcmToken);
    this.setState({ token: fcmToken });
    //aqui podriamos intentar conseguir el user desde un Asyncstorage y luego llamar la funcion save token y pasar por parametors el tokenFCM


    this.getUser().then(value => {
      this.saveToken(fcmToken,value);
    });
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log("permission rejected");
    }
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body } = notification;
        console.log("onNotification:");
        this.setState({ title: title });
        this.setState({ body: body });

        const localNotification = new firebase.notifications.Notification({
          sound: "sampleaudio",
          show_in_foreground: true
        })
          .setSound("sampleaudio.wav")
          .setNotificationId(notification.notificationId)
          .setTitle(notification.title)
          .setBody(notification.body)
          .android.setChannelId("fcm_FirebaseNotifiction_default_channel") // e.g. the id you chose above
          .android.setSmallIcon("@drawable/ic_launcher") // create this icon in Android Studio
          .android.setColor("#000000") // you can set a color here
          .android.setPriority(firebase.notifications.Android.Priority.High);

        firebase
          .notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err));
      });

    const channel = new firebase.notifications.Android.Channel(
      "fcm_FirebaseNotifiction_default_channel",
      "Demo app name",
      firebase.notifications.Android.Importance.High
    )
      .setDescription("Demo app description")
      .setSound("sampleaudio.wav");
    firebase.notifications().android.createChannel(channel);

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const { title, body } = notificationOpen.notification;
        console.log("onNotificationOpened:");
        Alert.alert(title, body);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      console.log("getInitialNotification:");
      Alert.alert(title, body);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      console.log("JSON.stringify:", JSON.stringify(message));
    });
  }
  //Login
  renderContent() {
    switch (this.state.loggeIn) {
      case true:
        return (
          <CardSection>
            <Button onPress={this.onButtonPressLogout.bind(this)}>Salir</Button>
          </CardSection>
        );
      case false:
        return <LoginForm />;
      default:
        return <Spinner size="large" />;
    }
  }

  render() {
    return (
      <View>
        <Header headerText="Autenticacion" />
        {this.renderContent()}
        <Text>el token es {this.state.token}</Text>
      </View>
    );
  }
}
