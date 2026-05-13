import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Input from '../../components/Form/Input/Input';
import FilePicker from '../../components/Form/Input/FilePicker';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import { generateBase64FromImage, validateImageFile } from '../../util/image';
import Auth from './Auth';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

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
      avatar: {
        value: null,           // File object (optional)
        valid: true,           // optional → always valid
        touched: false,
        validators: []
      },
      formIsValid: false
    },
    avatarPreview: null,
    avatarError: null,
  };

  inputChangeHandler = (input, value, files) => {
    if (input === 'avatar') {
      const file = files && files[0];
      if (file) {
        // Validate before doing anything else — reject early.
        try {
          validateImageFile(file, { maxBytes: AVATAR_MAX_BYTES });
        } catch (err) {
          this.setState({ avatarError: err.message, avatarPreview: null });
          // Clear the rejected file from state so submit doesn't pick it up.
          this.setState((prev) => ({
            signupForm: {
              ...prev.signupForm,
              avatar: { ...prev.signupForm.avatar, value: null, touched: true },
            },
          }));
          return;
        }
        this.setState({ avatarError: null });
        generateBase64FromImage(file)
          .then((b64) => this.setState({ avatarPreview: b64 }))
          .catch(() => this.setState({ avatarPreview: null }));
      } else {
        this.setState({ avatarPreview: null, avatarError: null });
      }
    }

    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.signupForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const nextValue = input === 'avatar' ? (files ? files[0] : null) : value;
      const updatedForm = {
        ...prevState.signupForm,
        [input]: { ...prevState.signupForm[input], valid: isValid, value: nextValue }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        if (inputName === 'formIsValid') continue;
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

  removeAvatarHandler = () => {
    this.setState((prev) => ({
      avatarPreview: null,
      signupForm: {
        ...prev.signupForm,
        avatar: { ...prev.signupForm.avatar, value: null, touched: false },
      },
    }));
  };

  render() {
    const { avatarPreview, avatarError } = this.state;
    const nameValue = this.state.signupForm.name.value || '';
    const fallbackInitial = nameValue.trim().charAt(0).toUpperCase() || '?';

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
          <div className="signup__avatar-row">
            <div className="signup__avatar-preview" aria-hidden="true">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" />
              ) : (
                <span>{fallbackInitial}</span>
              )}
            </div>
            <div className="signup__avatar-actions">
              <label htmlFor="avatar" className="signup__avatar-label">
                Profile picture <span className="signup__optional">(optional)</span>
              </label>
              <p className={['signup__avatar-hint', avatarError ? 'signup__avatar-hint--error' : ''].join(' ')}>
                {avatarError
                  ? avatarError
                  : avatarPreview
                    ? 'Looks good. Hit save below to finish.'
                    : 'Add a photo so friends can recognise you. PNG, JPG, or WebP, up to 5 MB.'}
              </p>
              <div className="signup__avatar-buttons">
                <label className="signup__avatar-button" htmlFor="avatar">
                  {avatarPreview ? 'Change photo' : 'Choose a photo'}
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    className="signup__avatar-remove"
                    onClick={this.removeAvatarHandler}
                  >
                    Remove
                  </button>
                )}
              </div>
              <FilePicker
                id="avatar"
                control="input"
                onChange={this.inputChangeHandler}
                onBlur={this.inputBlurHandler.bind(this, 'avatar')}
                valid={this.state.signupForm.avatar.valid}
                touched={this.state.signupForm.avatar.touched}
              />
            </div>
          </div>

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
