import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as API from '../api/API';
import Company from "./Company";
import College from "./College";

class Welcome extends Component {

    static propTypes = {
        handleLogout: PropTypes.func.isRequired
    };

    state = {
        username : '',
        typeofuser:''
    };

    componentWillMount(){
        this.setState({
            username : this.props.state.username,
            typeofuser:this.props.state.typeofuser
        });

    }

    componentDidMount(){
        document.title = `Welcome, ${this.state.username} !!`;
    }

    render(){
        return(
            <div>
                <div className={'rightfloat'}> <button className="btn btn-primary" onClick={() => this.props.handleLogout()}>Logout</button></div>
                {this.state.typeofuser=='Student'?<College/>:<Company/>}
            </div>
        )
    }
}

export default Welcome;