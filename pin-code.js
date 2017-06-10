import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { TextInput, View, Text } from 'react-native';

import { codePinStyles } from './pin-code-style';

class CodePin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      code: props.defaultCode ? props.defaultCode.split('') : new Array(props.number).fill(''),
      edit: 0
    };

    this.textInputsRefs = [];
  }

  clean = () => {
    this.setState({
      code: new Array(this.props.number).fill(''),
      edit: 0
    });
    this.focus(0);
  };

  focus = id => {
    this.textInputsRefs[id].focus();
  };

  removeFocus = id => {
    this.textInputsRefs[id].blur();
  };

  isFocus = id => {
    let newCode = this.state.code.slice();
    let codeChanged = false;

    for (let i = 0; i < newCode.length; i++)
      if (i >= id) newCode[i] = '';

    if (this.state.code !== newCode)
      codeChanged = true;

    this.setState({
      code: newCode,
      edit: id
    });

    if (codeChanged)
      this.props.onChange(newCode.join(''));
  };

  handleEdit = (char, id) => {
    let newCode = this.state.code.slice();

    if (this.props.numeric) {
      const digit = char.match(/\d+/g);
      if (!digit) {
        newCode[id] = digit;
        this.setState({ code: newCode });

        return;
      }
    }

    newCode[id] = char;

    // User filling the last pin ?
    if (id === this.props.number - 1) {
      // But it's different than code
      if (this.props.code && this.props.code !== newCode.join('')) {
        this.focus(0);

        this.setState({
          error: this.props.error,
          code: new Array(this.props.number).fill(''),
          edit: 0,
        });

        return;
      } else {
        this.removeFocus(id);

        this.setState({
          error: '',
          code: newCode,
        });

        if (this.props.onChange)
          this.props.onChange(newCode.join(''));

        if (this.props.onSuccess)
          this.props.onSuccess();
      }

      return;
    }

    this.focus(this.state.edit + 1);

    this.setState(prevState => {
      return {
        error: '',
        code: newCode,
        edit: prevState.edit + 1,
      };
    });

    if (this.props.onChange)
      this.props.onChange(newCode.join(''));
  };

  // TODO: test on iOS
  handleKeyPress = (event, id) => {
    const key = event.key;
    let newCode = this.state.code.slice();

    if (id && key === 'Backspace' && !this.state.code[id]) {
      newCode[id - 1] = '';

      this.focus(this.state.edit - 1);

      this.setState(prevState => {
        return {
          error: '',
          code: newCode,
          edit: prevState.edit - 1,
        };
      });
    }
  };

  render() {
    const {
      text,
      number,
      pinStyle,
      textStyle,
      errorStyle,
      containerStyle,
      containerPinStyle,
      ...props
    } = this.props;

    pins = [];

    for (let index = 0; index < number; index++) {
      const id = index;
      pins.push(
        <TextInput
          key={id}
          ref={ref => (this.textInputsRefs[id] = ref)}
          onChangeText={text => this.handleEdit(text, id)}
          onFocus={() => this.isFocus(id)}
          onKeyPress={event => this.handleKeyPress(event, id)}
          value={this.state.code[id] ? this.state.code[id].toString() : ''}
          style={[codePinStyles.pin, pinStyle]}
          returnKeyType={'done'}
          autoCapitalize={'sentences'}
          autoCorrect={false}
          keyboardType={this.props.numeric ? 'numeric' : 'default'}
          maxLength={1}
          {...props}
        />
      );
    }

    const error = this.props.code && this.state.error
      ? <Text style={[codePinStyles.error, errorStyle]}>
        {this.state.error}
      </Text>
      : null;

    return (
      <View style={[codePinStyles.container, containerStyle]}>

        { this.props.code &&
        <Text style={[codePinStyles.text, textStyle]}>
          {text}
        </Text>
        }

        {error}

        <View style={[codePinStyles.containerPin, containerPinStyle]}>

          {pins}

        </View>

      </View>
    );
  }
}

CodePin.propTypes = {
  onSuccess: PropTypes.func,
  onChange: PropTypes.func,
  code: PropTypes.string,
  defaultCode: PropTypes.string,
  number: PropTypes.number,
  pinStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  containerPinStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  errorStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  numeric: PropTypes.bool,
};

CodePin.defaultProps = {
  number: 4,
  text: 'Pin code',
  error: 'Bad pin code.',
  pinStyle: {},
  containerPinStyle: {},
  containerStyle: {},
  textStyle: {},
  errorStyle: {},
  numeric: false,
};

export default CodePin;
