import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import Auth from './Auth';

class Signup extends Component {
  state = {
    signupForm: {
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
      name: {
        value: '',
        valid: false,
        touched: false,
        validators: [required]
      },
      formIsValid: false
    }
  };

  inputChangeHandler = (input, value) => {
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.signupForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.signupForm,
        [input]: { ...prevState.signupForm[input], valid: isValid, value }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return { signupForm: updatedForm, formIsValid };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => ({
      signupForm: {
        ...prevState.signupForm,
        [input]: { ...prevState.signupForm[input], touched: true }
      }
    }));
  };

  render() {
    return (
      <Auth
        title="Create your account"
        lede="Join Dispatches to share what you're working on and follow your friends."
        footer={
          <span>
            Already have an account? <Link to="/">Log in</Link>
          </span>
        }
      >
        <form onSubmit={e => this.props.onSignup(e, this.state)}>
          <Input
            id="name"
            label="Display name"
            type="text"
            control="input"
            placeholder="What should we call you?"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'name')}
            value={this.state.signupForm['name'].value}
            valid={this.state.signupForm['name'].valid}
            touched={this.state.signupForm['name'].touched}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            control="input"
            placeholder="you@example.com"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'email')}
            value={this.state.signupForm['email'].value}
            valid={this.state.signupForm['email'].valid}
            touched={this.state.signupForm['email'].touched}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            control="input"
            placeholder="At least 5 characters"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'password')}
            value={this.state.signupForm['password'].value}
            valid={this.state.signupForm['password'].valid}
            touched={this.state.signupForm['password'].touched}
          />
          <Button design="accent" mode="raised" type="submit" loading={this.props.loading}>
            Create account
          </Button>
        </form>
      </Auth>
    );
  }
}

export default Signup;
