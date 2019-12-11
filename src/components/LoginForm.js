import React, { Component } from "react";
import { Text } from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import { Card, CardSection, Button, Input, Spinner } from "./common";
import Login from "./Login";
import App from "../App";
import { LOGIN_URL } from "../config/URL";
 
class LoginForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      loading: false,
      load: false
    };
    this.saveKey = this.saveKey.bind(this);
    this.onloginSuccess =  this.onloginSuccess.bind(this);
    this.onLoginFaild = this.onLoginFaild.bind(this);

  }


  onButtonPress() {
    const { email, password } = this.state;
    this.setState({ error: "", loading: true });

    fetch(LOGIN_URL,{
      method:'POST',
      body:JSON.stringify({
          email: email,
          password: password
      }),
      headers:{ 
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
        },
  })
  .then(response => response.json())
  .then(json =>{
      if(json.error){
        this.onLoginFaild();
      }
      else{

        console.log('JSON',json.access_token);
        const value = json.access_token;
        this.saveKey(value); 
       // this.onloginSuccess();
      }

 })
  .catch((error) => {
    console.log('ERROR',error);
    this.onLoginFaild();
})

  }

  async saveKey(value) {
    try {
      await AsyncStorage.setItem('@token', value);
      console.log('se guardo la key');
      this.onloginSuccess();
    } catch (error) {
      console.log("Error saving data" + error);
    }
  }

  onLoginFaild() {
    this.setState({
      email: "",
      password:"",
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
    return <Button onPress={this.onButtonPress.bind(this)}>Log in</Button>;
  }

  render() {
if(this.state.load){
return <Login />;
}
else{
  return (
    <Card>
      <CardSection>
        <Input
          placeholder="user@gmail.com"
          label="Email"
          value={this.state.email}
          onChangeText={email => this.setState({ email })}
        />
      </CardSection>
      <CardSection>
        <Input
          secureTextEntry
          placeholder="password"
          label="Password"
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
