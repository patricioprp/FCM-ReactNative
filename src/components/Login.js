import React, { Component } from "react";
import AsyncStorage from '@react-native-community/async-storage';
import {  Button, Spinner, CardSection, } from "./common";
import { Text, View } from "react-native";
import LoginForm from "./LoginForm";
import { USER_URL, LOGOUT_URL} from "../config/URL";

class Login extends Component{
constructor(props){
   super(props);
   this.state = {
    loggeIn: null,
    user:''
  };
  this.getKey = this.getKey.bind(this);
  this.login = this.login.bind(this);
}

componentWillMount() {
    this.login();   
  }

  login() {
    this.getKey().then(value => {
        console.log('value',value)
        fetch(USER_URL,{
          method:'POST',
          body: JSON.stringify({
            token: value
          }),
          headers:{ 
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
            },
      })
      .then(response => response.json())
      .then(json =>{
         console.log('JSON',json);
         if(json.error){
          this.setState({ loggeIn: false });
         }
         else{
          this.setState({ loggeIn: true });
          console.log('loggeIn',this.state.loggeIn);
          this.setState({ user: json});
         }
     
      })
      .catch((error) => {
        console.log('ERROR',error)
        this.setState({ loggeIn: false });
        console.log('loggeIn',this.state.loggeIn);
     })
      });
    }

    async getKey() {
        try {
          const value = await AsyncStorage.getItem('@token');
          console.log('accediendo la key',value);
         return (value)
        } catch (error) {
          console.log("Error retrieving data" + error);
        };
      }

      onButtonPressLogout()
      {
    this.getKey().then(value => {
      console.log(value)
      fetch(LOGOUT_URL,{
        method:'POST',
        body: JSON.stringify({
          token: value
        }),
        headers:{ 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
          },
    })
    .then(response => response.json())
    .then(json =>{
       console.log('JSON',json);
       this.setState({
         loggeIn: false,
         user:''
        });
    
    })
    .catch((error) => {
      console.log('ERROR',error)
    })
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