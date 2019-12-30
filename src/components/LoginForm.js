import React, { Component } from "react";
import { Text, AsyncStorage } from "react-native";
import { Card, CardSection, Button, Input, Spinner } from "./common";
import Login from "./Login";
import { LOGIN_URL, TOKEN_FCM_URL } from "../config/URL";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      loading: false,
      load: false
    };
    this.getKeyFCM = this.getKeyFCM.bind(this);
    this.saveTokenFCM = this.saveTokenFCM.bind(this);
    this.saveKeyFCM = this.saveKeyFCM.bind(this);
    this.onloginSuccess = this.onloginSuccess.bind(this);
    this.onLoginFaild = this.onLoginFaild.bind(this);
  }

  async saveTokenFCM(token,id) {
    //Token Save POST
    this.getKeyFCM().then(value => {
      console.log("FCMToken value",value);
      fetch(TOKEN_FCM_URL + "/" + id + "/" + value, {
        method: "POST",
        body: JSON.stringify({
          token: token
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      })
        .then(response => response.json())
        .then(json => {
          console.log("jsonSaveTokenFCM", json);
        })
        .catch(error => {
          console.log("errorSaveTokenFCM", error);
        });
    });
    //End Token Save Post
  }

  onButtonPress() {
    const { email, password } = this.state;
    this.setState({ error: "", loading: true });

    fetch(LOGIN_URL, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      }),
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          this.onLoginFaild();
        } else {
          const token = json.access_token;
          this.saveKeyFCM(token);
        }
      })
      .catch(error => {
        console.log("ERROR", error);
        this.onLoginFaild();
      });
  }

  async saveKeyFCM(token) {
    try {
      await AsyncStorage.setItem("token", token);
      this.onloginSuccess();
      this.getUser().then(value => {
        this.saveTokenFCM(token, value);
      });
    } catch (error) {
      console.log("Error saving data" + error);
    }
  }

  async getKeyFCM() {
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

  onLoginFaild() {
    this.setState({
      email: "",
      password: "",
      error: "Fallo la Autenticacion.!!!",
      loading: false
    });
  }

  onloginSuccess() {
    this.setState({
      email: "",
      password: "",
      loading: false,
      load: true,
      error: ""
    });
  }
  renderButton() {
    if (this.state.loading) {
      return <Spinner size="small" />;
    }
    return <Button onPress={this.onButtonPress.bind(this)}>Ingresar</Button>;
  }

  render() {
    if (this.state.load) {
      return <Login />;
    } else {
      return (
        <Card>
          <CardSection>
            <Input
              placeholder="usuario@email.com"
              label="Email"
              value={this.state.email}
              onChangeText={email => this.setState({ email })}
            />
          </CardSection>
          <CardSection>
            <Input
              secureTextEntry
              placeholder="contraseña"
              label="Contraseña"
              value={this.state.password}
              onChangeText={password => this.setState({ password })}
            />
          </CardSection>
          <Text style={styles.errorTextStyles}>{this.state.error}</Text>
          <CardSection>{this.renderButton()}</CardSection>
        </Card>
      );
    }
  }
}

const styles = {
  errorTextStyles: {
    fontSize: 20,
    alignSelf: "center",
    color: "red"
  }
};
export default LoginForm;
