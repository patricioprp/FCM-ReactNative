import React, { Component } from "react";
import { Button, Spinner, CardSection } from "./common";
import { Text, View, AsyncStorage } from "react-native";
import LoginForm from "./LoginForm";
import { USER_URL, LOGOUT_URL } from "../config/URL";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggeIn: null,
      user: ""
    };
    this.saveUser = this.saveUser.bind(this);
    this.getKey = this.getKey.bind(this);
    this.login = this.login.bind(this);
  }

  componentDidMount() {
    this.login();
  }

  login() {
    this.getKey().then(value => {
      //   console.log('tokenLogin',value)
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
          //console.log('JSON',json);
          if (json.error) {
            this.setState({ loggeIn: false });
          } else {
            this.setState({ loggeIn: true });
            // console.log('loggeIn',this.state.loggeIn);
            this.setState({ user: json });
            //AsyncStorage solo recibe string es por eso que al id hay q convertirlo a string
            const id = json.id;
            const val = id.toString();
            this.saveUser(val);
          }
        })
        .catch(error => {
          console.log("ERROR", error);
          this.setState({ loggeIn: false });
          console.log("loggeIn", this.state.loggeIn);
        });
    });
  }

  async saveUser(value) {
    try {
      await AsyncStorage.setItem("userId", value);
    } catch (error) {
      console.log("Error saving data" + error);
    }
  }

  async getKey() {
    try {
      const value = await AsyncStorage.getItem("token");
      // console.log('accediendo la key del login',value);
      return value;
    } catch (error) {
      console.log("Error retrieving data" + error);
    }
  }

  onButtonPressLogout() {
    this.getKey().then(value => {
      console.log(value);
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
          //   console.log('JSON',json);
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
        {this.renderContent()}
        <Text>{this.state.user.name}</Text>
        <Text>{this.state.user.email}</Text>
      </View>
    );
  }
}

export default Login;
