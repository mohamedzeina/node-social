import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import Auth from './Auth';

class Login extends Component {
  state = {
    loginForm: {
      email: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, email]
      },
      password: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })]
      },
      formIsValid: false
    }
  };

  inputChangeHandler = (input, value) => {
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.loginForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.loginForm,
        [input]: { ...prevState.loginForm[input], valid: isValid, value }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return { loginForm: updatedForm, formIsValid };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => ({
      loginForm: {
        ...prevState.loginForm,
        [input]: { ...prevState.loginForm[input], touched: true }
      }
    }));
  };

  render() {
    return (
      <Auth
        title="Welcome back"
        lede="Log in to keep up with what your friends are sharing."
        footer={
          <span>
            New here? <Link to="/signup">Create an account</Link>
          </span>
        }
      >
        <form
          onSubmit={e =>
            this.props.onLogin(e, {
              email: this.state.loginForm.email.value,
              password: this.state.loginForm.password.value
            })
          }
        >
          <Input
            id="email"
            label="Email"
            type="email"
            control="input"
            placeholder="you@example.com"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'email')}
            value={this.state.loginForm['email'].value}
            valid={this.state.loginForm['email'].valid}
            touched={this.state.loginForm['email'].touched}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            control="input"
            placeholder="••••••••"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'password')}
            value={this.state.loginForm['password'].value}
            valid={this.state.loginForm['password'].valid}
            touched={this.state.loginForm['password'].touched}
          />
          <Button design="accent" mode="raised" type="submit" loading={this.props.loading}>
            Log in
          </Button>
        </form>
      </Auth>
    );
  }
}

export default Login;
