import React, { Component } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import './theme/assets/styles/main.css';
import Layout from './components/Layout';

class App extends Component {
    render() {
        return (
            <Layout title="Chat App" />
        );
    }
}

export default App;
